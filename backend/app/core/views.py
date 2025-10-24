from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
from django.db.models import Avg
from .models import Student, Course, Lesson, Attempt
from .serializers import CourseSerializer, AttemptCreateSerializer, LessonSerializer
from .services.recommender import score_candidate, to_confidence

class WriteThrottle(UserRateThrottle):
    rate='30/min'

@api_view(['GET'])
def student_overview(request, pk:int):
    try:
        student=Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response({'detail':'Not found'}, status=404)
    courses=Course.objects.prefetch_related('lessons').all()
    data=[]
    for c in courses:
        attempts=Attempt.objects.filter(student=student, lesson__course=c).order_by('-timestamp')
        progress=min(100, attempts.count()*10)
        last_activity=attempts.first().timestamp.isoformat() if attempts.exists() else None
        data.append({'id':c.id,'name':c.name,'description':c.description,'difficulty':c.difficulty,'progress':progress,'last_activity':last_activity,'next_up': (c.lessons.first().title if c.lessons.exists() else None)})
    return Response({'student':{'id':student.id,'name':student.name},'courses':data})

@api_view(['GET'])
def student_recommendation(request, pk:int):
    try:
        student=Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response({'detail':'Not found'}, status=404)
    courses=Course.objects.all()
    items=[]
    for c in courses:
        attempts=Attempt.objects.filter(student=student, lesson__course=c).order_by('-timestamp')
        progress=min(100, attempts.count()*10)
        recency_gap_days=5.0; tag_gap=0.3
        hint_rate=(attempts.aggregate(avg=Avg('hints_used'))['avg'] or 0)/3.0
        s, feats=score_candidate(progress, recency_gap_days, tag_gap, hint_rate)
        items.append({'id':str(c.id),'title':f'Continue "{c.name}" — next lesson','score':s,'features':feats})
    items.sort(key=lambda x:x['score'], reverse=True)
    top=items[0]; alts=items[1:3]
    return Response({'recommendation':{'id':top['id'],'title':top['title']},'confidence':to_confidence(top['score']),'reason_features':top['features'],'alternatives':[{'id':a['id'],'title':a['title']} for a in alts]})

@api_view(['POST'])
@throttle_classes([WriteThrottle])
def create_attempt(request):
    ser=AttemptCreateSerializer(data=request.data)
    if ser.is_valid():
        a=ser.save(); return Response({'id':a.id}, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=400)

@api_view(['POST'])
def analyze_code(request):
    import ast
    code=request.data.get('code','')
    issues=[]
    try:
        tree=ast.parse(code)
        class ArgVisitor(ast.NodeVisitor):
            def visit_FunctionDef(self, node):
                arg_names=[a.arg for a in node.args.args]
                used=set()
                class UseVisitor(ast.NodeVisitor):
                    def visit_Name(self, n):
                        if isinstance(n.ctx, ast.Load): used.add(n.id)
                UseVisitor().visit(node)
                for a in arg_names:
                    if a not in used: issues.append({'rule':'unused-arg','message':f'Function arg "{a}" appears unused.','severity':'info'})
        ArgVisitor().visit(tree)
        class ExceptVisitor(ast.NodeVisitor):
            def visit_ExceptHandler(self, node):
                if node.type is None: issues.append({'rule':'bare-except','message':'Avoid bare except; catch specific exceptions.','severity':'warn'})
        ExceptVisitor().visit(tree)
        class PrintVisitor(ast.NodeVisitor):
            def visit_Call(self, node):
                if getattr(node.func,'id',None)=='print': issues.append({'rule':'print-call','message':'Avoid print statements; use logging.','severity':'info'})
        PrintVisitor().visit(tree)
    except SyntaxError as e:
        issues.append({'rule':'syntax-error','message':str(e),'severity':'error'})
    return Response({'issues':issues})

@api_view(['GET'])
def get_course(request, pk: int):
    try:
        course = Course.objects.prefetch_related('lessons').get(pk=pk)
    except Course.DoesNotExist:
        return Response({'detail': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CourseSerializer(course)
    return Response(serializer.data)

@api_view(['GET'])
def get_lesson(request, pk: int):
    try:
        lesson = Lesson.objects.select_related('course').get(pk=pk)
    except Lesson.DoesNotExist:
        return Response({'detail': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)

    data = LessonSerializer(lesson).data
    data['course_name'] = lesson.course.name  
    data['course_id'] = lesson.course.id  

    student_id = request.query_params.get('student_id')
    if student_id:
        attempts = Attempt.objects.filter(student_id=student_id, lesson=lesson).order_by('-timestamp')
        if attempts.exists():
            last_attempt = attempts.first()
            total_attempts = attempts.count()
            avg_correctness = attempts.aggregate(avg=Avg('correctness'))['avg'] or 0
            avg_duration = attempts.aggregate(avg=Avg('duration_sec'))['avg'] or 0
            best_attempt = attempts.order_by('-correctness').first()
            data['student_attempt'] = {
                'correctness': last_attempt.correctness,
                'hints_used': last_attempt.hints_used,
                'duration_sec': last_attempt.duration_sec,
                'timestamp': last_attempt.timestamp.isoformat(),
                'code_quality': round(avg_correctness, 2),
                'avg_duration_sec': round(avg_duration, 2)  ,
                'total_attempts': total_attempts,
                'best_attempts': best_attempt.correctness
            }
        else:
            data['student_attempt'] = None

    return Response(data)


@api_view(['POST'])
@throttle_classes([WriteThrottle])
def add_attempt(request):
    serializer = AttemptCreateSerializer(data=request.data)
    if serializer.is_valid():
        attempt = serializer.save()
        return Response({
            'id': attempt.id,
            'student': attempt.student.id,
            'lesson': attempt.lesson.id,
            'correctness': attempt.correctness,
            'hints_used': attempt.hints_used,
            'duration_sec': attempt.duration_sec,
            'timestamp': attempt.timestamp.isoformat()
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)