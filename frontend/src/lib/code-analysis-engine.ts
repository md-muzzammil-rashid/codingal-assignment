import type { CodeIssue } from "./types"

interface AnalysisRule {
  rule: string
  check: (code: string, lines: string[]) => CodeIssue[]
  message: string
  suggestion: string
  severity: "error" | "warning" | "info"
}

const analysisRules: AnalysisRule[] = [
  // Rule 1: Multiple semicolons
  {
    rule: "multiple-semicolons",
    message: "Multiple consecutive semicolons",
    suggestion: "Remove extra semicolons",
    severity: "error",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      const pattern = /;{2,}/g
      
      let match
      while ((match = pattern.exec(code)) !== null) {
        const beforeMatch = code.substring(0, match.index)
        const lineNumber = beforeMatch.split("\n").length
        const lastNewline = beforeMatch.lastIndexOf("\n")
        const column = match.index - lastNewline
        
        issues.push({
          rule: "multiple-semicolons",
          line: lineNumber,
          column: Math.max(1, column),
          message: "Multiple consecutive semicolons",
          suggestion: "Remove extra semicolons",
          severity: "error"
        })
      }
      
      return issues
    }
  },
  
  // Rule 2: Empty or meaningless brace blocks
  {
    rule: "empty-braces",
    message: "Empty or meaningless brace block",
    suggestion: "Remove empty braces or add meaningful code",
    severity: "warning",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      // Match {{ or }} or { { or } } patterns
      const patterns = [
        /\{\s*\{\s*\}\s*\}/g,  // {{}}
        /\{\s*\{/g,            // {{ 
      ]
      
      patterns.forEach(pattern => {
        let match
        const p = new RegExp(pattern)
        while ((match = p.exec(code)) !== null) {
          // Check if it's not inside a string or comment
          const beforeMatch = code.substring(0, match.index)
          const inString = (beforeMatch.match(/"/g) || []).length % 2 !== 0 ||
                          (beforeMatch.match(/'/g) || []).length % 2 !== 0
          
          if (!inString) {
            const lineNumber = beforeMatch.split("\n").length
            const lastNewline = beforeMatch.lastIndexOf("\n")
            const column = match.index - lastNewline
            
            issues.push({
              rule: "empty-braces",
              line: lineNumber,
              column: Math.max(1, column),
              message: "Empty or meaningless nested brace block",
              suggestion: "Remove unnecessary braces or add meaningful code",
              severity: "warning"

            })
          }
        }
      })
      
      return issues
    }
  },
  
  // Rule 3: Mismatched braces
  {
    rule: "mismatched-braces",
    message: "Mismatched curly braces",
    suggestion: "Ensure every opening brace has a matching closing brace",
    severity: "error",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      let braceCount = 0
      let braceStack: Array<{line: number, column: number}> = []
      
      // Remove strings and comments to avoid false positives
      let cleanCode = code.replace(/"[^"]*"/g, '""')
                          .replace(/'[^']*'/g, "''")
                          .replace(/\/\/.*$/gm, '')
                          .replace(/\/\*[\s\S]*?\*\//g, '')
      
      for (let i = 0; i < cleanCode.length; i++) {
        if (cleanCode[i] === '{') {
          braceCount++
          const beforeMatch = code.substring(0, i)
          const lineNumber = beforeMatch.split("\n").length
          const lastNewline = beforeMatch.lastIndexOf("\n")
          const column = i - lastNewline
          braceStack.push({line: lineNumber, column})
        } else if (cleanCode[i] === '}') {
          braceCount--
          if (braceCount < 0) {
            const beforeMatch = code.substring(0, i)
            const lineNumber = beforeMatch.split("\n").length
            const lastNewline = beforeMatch.lastIndexOf("\n")
            const column = i - lastNewline
            
            issues.push({
              rule: "mismatched-braces",
              line: lineNumber,
              column: Math.max(1, column),
              message: "Closing brace without matching opening brace",
              suggestion: "Remove extra closing brace or add opening brace",
              severity: "error"
            })
            braceCount = 0
          } else {
            braceStack.pop()
          }
        }
      }
      
      if (braceCount > 0 && braceStack.length > 0) {
        const lastBrace = braceStack[braceStack.length - 1]
        issues.push({
          rule: "mismatched-braces",
          line: lastBrace.line,
          column: Math.max(1, lastBrace.column),
          message: "Opening brace without matching closing brace",
          suggestion: "Add closing brace or remove opening brace",
          severity: "error"
        })
      }
      
      return issues
    }
  },
  
  // Rule 4: Mismatched parentheses
  {
    rule: "mismatched-parentheses",
    message: "Mismatched parentheses",
    suggestion: "Ensure every opening parenthesis has a matching closing parenthesis",
    severity: "error",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      let parenCount = 0
      let parenStack: Array<{line: number, column: number}> = []
      
      let cleanCode = code.replace(/"[^"]*"/g, '""')
                          .replace(/'[^']*'/g, "''")
                          .replace(/\/\/.*$/gm, '')
                          .replace(/\/\*[\s\S]*?\*\//g, '')
      
      for (let i = 0; i < cleanCode.length; i++) {
        if (cleanCode[i] === '(') {
          parenCount++
          const beforeMatch = code.substring(0, i)
          const lineNumber = beforeMatch.split("\n").length
          const lastNewline = beforeMatch.lastIndexOf("\n")
          const column = i - lastNewline
          parenStack.push({line: lineNumber, column})
        } else if (cleanCode[i] === ')') {
          parenCount--
          if (parenCount < 0) {
            const beforeMatch = code.substring(0, i)
            const lineNumber = beforeMatch.split("\n").length
            const lastNewline = beforeMatch.lastIndexOf("\n")
            const column = i - lastNewline
            
            issues.push({
              rule: "mismatched-parentheses",
              line: lineNumber,
              column: Math.max(1, column),
              message: "Closing parenthesis without matching opening parenthesis",
              suggestion: "Remove extra closing parenthesis or add opening parenthesis",
              severity: "error"
            })
            parenCount = 0
          } else {
            parenStack.pop()
          }
        }
      }
      
      if (parenCount > 0 && parenStack.length > 0) {
        const lastParen = parenStack[parenStack.length - 1]
        issues.push({
          rule: "mismatched-parentheses",
          line: lastParen.line,
          column: Math.max(1, lastParen.column),
          message: "Opening parenthesis without matching closing parenthesis",
          suggestion: "Add closing parenthesis or remove opening parenthesis",
          severity: "error"
        })
      }
      
      return issues
    }
  },
  
  // Rule 5: Mismatched brackets
  {
    rule: "mismatched-brackets",
    message: "Mismatched square brackets",
    suggestion: "Ensure every opening bracket has a matching closing bracket",
    severity: "error",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      let bracketCount = 0
      let bracketStack: Array<{line: number, column: number}> = []
      
      let cleanCode = code.replace(/"[^"]*"/g, '""')
                          .replace(/'[^']*'/g, "''")
                          .replace(/\/\/.*$/gm, '')
                          .replace(/\/\*[\s\S]*?\*\//g, '')
      
      for (let i = 0; i < cleanCode.length; i++) {
        if (cleanCode[i] === '[') {
          bracketCount++
          const beforeMatch = code.substring(0, i)
          const lineNumber = beforeMatch.split("\n").length
          const lastNewline = beforeMatch.lastIndexOf("\n")
          const column = i - lastNewline
          bracketStack.push({line: lineNumber, column})
        } else if (cleanCode[i] === ']') {
          bracketCount--
          if (bracketCount < 0) {
            const beforeMatch = code.substring(0, i)
            const lineNumber = beforeMatch.split("\n").length
            const lastNewline = beforeMatch.lastIndexOf("\n")
            const column = i - lastNewline
            
            issues.push({
              rule: "mismatched-brackets",
              line: lineNumber,
              column: Math.max(1, column),
              message: "Closing bracket without matching opening bracket",
              suggestion: "Remove extra closing bracket or add opening bracket",
              severity: "error"
            })
            bracketCount = 0
          } else {
            bracketStack.pop()
          }
        }
      }
      
      if (bracketCount > 0 && bracketStack.length > 0) {
        const lastBracket = bracketStack[bracketStack.length - 1]
        issues.push({
          rule: "mismatched-brackets",
          line: lastBracket.line,
          column: Math.max(1, lastBracket.column),
          message: "Opening bracket without matching closing bracket",
          suggestion: "Add closing bracket or remove opening bracket",
          severity: "error"
        })
      }
      
      return issues
    }
  },
  
  // Rule 6: Incomplete expressions and lone statements
  {
    rule: "incomplete-expression",
    message: "Incomplete or meaningless statement",
    suggestion: "Complete the statement, assign to variable, or remove if unused",
    severity: "error",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        
        // Skip empty lines, comments, and preprocessor directives
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || 
            trimmed.startsWith('*') || trimmed.startsWith('#') || trimmed === '}' || trimmed === '{') {
          return
        }
        
        // Pattern 1: Just a variable name with semicolon or alone (a; or da)
        const loneVarPattern = /^[a-zA-Z_]\w*;?$/
        if (loneVarPattern.test(trimmed)) {
          // Check if it's not a function call or declaration context
          const prevLine = index > 0 ? lines[index - 1].trim() : ''
          const nextLine = index < lines.length - 1 ? lines[index + 1].trim() : ''
          
          // Skip if it looks like a label or type declaration
          if (!prevLine.includes('int') && !prevLine.includes('float') && 
              !prevLine.includes('double') && !prevLine.includes('char') &&
              !trimmed.endsWith(':') && !nextLine.startsWith(':')) {
            issues.push({
              rule: "incomplete-expression",
              line: index + 1,
              column: 1,
              message: "Lone variable statement with no effect",
              suggestion: "Remove unused statement or complete the expression",
              severity: "error"
            })
          }
        }
        
        // Pattern 2: Operations without assignment (a+b; or x*y;)
        const incompleteOpPattern = /^[a-zA-Z_]\w*\s*[+\-*\/%]\s*[a-zA-Z_]\w*;?$/
        if (incompleteOpPattern.test(trimmed)) {
          const fullContext = lines.slice(Math.max(0, index - 2), index + 1).join('\n')
          if (!/return|=|cout|printf|print|System\.out|<</.test(fullContext)) {
            issues.push({
              rule: "incomplete-expression",
              line: index + 1,
              column: 1,
              message: "Expression result is not used or assigned",
              suggestion: "Assign the result to a variable, return it, or use it in output",
              severity: "error"
            })
          }
        }
      })
      
      return issues
    }
  },
  
  // Rule 7: Off-by-one in for loops
  {
    rule: "off-by-one-loop",
    message: "Potential off-by-one error in loop",
    suggestion: "Check loop bounds: typically use '<' with length/size or '<=' with max value",
    severity: "warning",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      
      // Match various loop patterns across languages
      // for(i=0; i<=arr.length; i++) or for(int i=1; i<n; i++)
      const patterns = [
        /for\s*\(\s*(?:int|let|const|var)?\s*(\w+)\s*=\s*0\s*;\s*\1\s*<=\s*\w+\.(?:length|size)\s*\(\s*\)/g,
        /for\s*\(\s*(?:int|let|const|var)?\s*(\w+)\s*=\s*0\s*;\s*\1\s*<=\s*\w+\.(?:length|size)/g,
      ]
      
      patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(code)) !== null) {
          const beforeMatch = code.substring(0, match.index)
          const lineNumber = beforeMatch.split("\n").length
          const lastNewline = beforeMatch.lastIndexOf("\n")
          const column = match.index - lastNewline
          
          issues.push({
            rule: "off-by-one-loop",
            line: lineNumber,
            column: Math.max(1, column),
            message: "Potential off-by-one error: loop may iterate beyond array bounds",
            suggestion: "Use '<' instead of '<=' when comparing with length/size",
            severity: "warning"
          })
        }
      })
      
      return issues
    }
  },
  
  // Rule 8: Missing return in functions with return type
  {
    rule: "missing-return",
    message: "Function may be missing a return statement",
    suggestion: "Add a return statement for all code paths",
    severity: "error",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      
      // Match function declarations with return types (C++, TypeScript, Java, etc.)
      const patterns = [
        // C++/Java: int functionName() { ... }
        /(?:int|float|double|long|short|char|bool|string|std::string|void)\s+(\w+)\s*\([^)]*\)\s*\{/g,
        // TypeScript: function name(): type { ... }
        /function\s+(\w+)\s*\([^)]*\)\s*:\s*(?!void)(\w+)\s*\{/g,
      ]
      
      patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(code)) !== null) {
          const returnType = match[0].split(/\s+/)[0]
          const funcName = match[1]
          
          // Skip void functions
          if (returnType === 'void') continue
          
          const funcStart = match.index + match[0].length
          
          // Find the closing brace
          let braceCount = 1
          let i = funcStart
          let funcEnd = funcStart
          
          while (i < code.length && braceCount > 0) {
            if (code[i] === '{') braceCount++
            if (code[i] === '}') braceCount--
            if (braceCount === 0) funcEnd = i
            i++
          }
          
          const funcBody = code.substring(funcStart, funcEnd)
          
          // Check if there's a return statement
          if (!/\breturn\b/.test(funcBody)) {
            const beforeMatch = code.substring(0, match.index)
            const lineNumber = beforeMatch.split("\n").length
            const lastNewline = beforeMatch.lastIndexOf("\n")
            const column = match.index - lastNewline
            
            issues.push({
              rule: "missing-return",
              line: lineNumber,
              column: Math.max(1, column),
              message: `Function '${funcName}' may be missing a return statement`,
              suggestion: "Add a return statement for all code paths",
              severity: "error"
            })
          }
        }
      })
      
      return issues
    }
  },
  
  // Rule 9: Duplicate code blocks
  {
    rule: "duplicate-code",
    message: "Duplicate code block detected",
    suggestion: "Extract duplicate code into a reusable function",
    severity: "info",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      const minBlockSize = 4 // Increased to avoid false positives
      const blocks: Array<{ content: string; startLine: number }> = []
      
      for (let i = 0; i < lines.length - minBlockSize; i++) {
        let blockLines: string[] = []
        let startLine = i
        
        for (let j = i; j < Math.min(i + 15, lines.length); j++) {
          const trimmed = lines[j].trim()
          if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && 
              !trimmed.startsWith('*') && trimmed.length > 5) {
            blockLines.push(trimmed)
            if (blockLines.length >= minBlockSize) {
              blocks.push({
                content: blockLines.join('\n'),
                startLine: startLine + 1
              })
            }
          } else if (blockLines.length > 0) {
            break
          } else {
            startLine = j + 1
          }
        }
      }
      
      const seen = new Map<string, { line: number; reported: boolean }>()
      blocks.forEach(block => {
        // Normalize: remove variables/identifiers to detect structural similarity
        const normalized = block.content
          .replace(/\b[a-zA-Z_]\w*\b/g, 'VAR')
          .replace(/\d+/g, 'NUM')
          .replace(/\s+/g, ' ')
        
        if (seen.has(normalized) && !seen.get(normalized)!.reported) {
          const original = seen.get(normalized)!
          if (Math.abs(block.startLine - original.line) > 3) { // Avoid flagging adjacent lines
            issues.push({
              rule: "duplicate-code",
              line: block.startLine,
              column: 1,
              message: `Duplicate code structure detected (similar to line ${original.line})`,
              suggestion: "Extract duplicate code into a reusable function",
              severity: "info"
            })
            seen.get(normalized)!.reported = true
          }
        } else if (!seen.has(normalized)) {
          seen.set(normalized, { line: block.startLine, reported: false })
        }
      })
      
      return issues
    }
  },
  
  // Rule 10: Empty catch/except blocks
  {
    rule: "empty-catch",
    message: "Empty exception handler detected",
    suggestion: "Handle errors properly or at least log them",
    severity: "warning",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      const patterns = [
        /catch\s*\([^)]*\)\s*\{\s*\}/g,  // Java/C++/JS
        /except[^:]*:\s*pass/g,          // Python
      ]
      
      patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(code)) !== null) {
          const beforeMatch = code.substring(0, match.index)
          const lineNumber = beforeMatch.split("\n").length
          const lastNewline = beforeMatch.lastIndexOf("\n")
          const column = match.index - lastNewline
          
          issues.push({
            rule: "empty-catch",
            line: lineNumber,
            column: Math.max(1, column),
            message: "Empty exception handler detected",
            suggestion: "Handle errors properly or at least log them",
            severity: "warning"
          })
        }
      })
      
      return issues
    }
  },
  
  // Rule 11: Unreachable code after return
  {
    rule: "unreachable-code",
    message: "Unreachable code after return statement",
    suggestion: "Remove code after return or restructure your logic",
    severity: "warning",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (/^\breturn\b/.test(trimmed) && !trimmed.endsWith('{')) {
          let braceLevel = 0
          for (let i = index + 1; i < lines.length; i++) {
            const nextLine = lines[i].trim()
            if (!nextLine || nextLine.startsWith('//') || nextLine.startsWith('/*')) continue
            
            braceLevel += (nextLine.match(/{/g) || []).length
            braceLevel -= (nextLine.match(/}/g) || []).length
            
            if (braceLevel < 0) break
            
            if (nextLine && nextLine !== '}' && braceLevel === 0) {
              issues.push({
                rule: "unreachable-code",
                line: i + 1,
                column: 1,
                message: "Unreachable code after return statement",
                suggestion: "Remove code after return or restructure your logic",
                severity: "warning"
              })
              break
            }
          }
        }
      })
      
      return issues
    }
  },
  
  // Rule 12: Undeclared variables in usage
  {
    rule: "undeclared-variable",
    message: "Variable used without being declared",
    suggestion: "Declare the variable before using it",
    severity: "error",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      
      // Track declared variables as we scan through code
      const declared = new Set<string>()
      
      // Common keywords and built-ins to exclude
      const keywords = new Set([
        'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
        'return', 'try', 'catch', 'finally', 'throw', 'new', 'typeof', 'void',
        'delete', 'in', 'of', 'instanceof', 'this', 'super', 'true', 'false',
        'null', 'undefined', 'NULL', 'nullptr', 'cout', 'cin', 'endl', 'std',
        'printf', 'scanf', 'malloc', 'free', 'sizeof', 'include', 'define',
        'int', 'float', 'double', 'char', 'bool', 'long', 'short', 'void',
        'string', 'auto', 'const', 'static', 'extern', 'register', 'volatile',
        'main', 'printf', 'scanf', 'cout', 'cin', 'vector', 'map', 'set',
        'String', 'System', 'Math', 'console', 'print', 'len', 'range',
        'let', 'const', 'var', 'function', 'class', 'public', 'private', 'protected'
      ])
      
      // First pass: collect all function names and parameters
      const funcPattern = /(?:int|float|double|char|bool|long|short|string|void|auto)\s+([a-zA-Z_]\w*)\s*\(/g
      let match
      while ((match = funcPattern.exec(code)) !== null) {
        declared.add(match[1])
      }
      
      // Collect function parameters
      const paramPattern = /\(([^)]*)\)/g
      while ((match = paramPattern.exec(code)) !== null) {
        const params = match[1].split(',')
        params.forEach(param => {
          const parts = param.trim().split(/[\s\*&]+/)
          const varName = parts[parts.length - 1]
          if (varName && /^[a-zA-Z_]\w*$/.test(varName)) {
            declared.add(varName)
          }
        })
      }
      
      // Second pass: scan line by line to find declarations and usages
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        
        // Skip comments and preprocessor directives
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || 
            trimmed.startsWith('*') || trimmed.startsWith('#')) {
          return
        }
        
        // Check if this line declares a variable
        const declPattern = /(?:int|float|double|char|bool|long|short|string|auto|let|const|var)\s+([a-zA-Z_]\w*)/g
        let declMatch
        const declaredOnThisLine = new Set<string>()
        
        while ((declMatch = declPattern.exec(line)) !== null) {
          declared.add(declMatch[1])
          declaredOnThisLine.add(declMatch[1])
        }
        
        // Now find all variable usages in this line
        const identPattern = /\b([a-zA-Z_]\w*)\b/g
        let identMatch
        const usedVars = []
        
        while ((identMatch = identPattern.exec(line)) !== null) {
          const identifier = identMatch[1]
          
          // Skip keywords
          if (keywords.has(identifier)) {
            continue
          }
          
          // Skip if declared on this line or before
          if (declared.has(identifier) || declaredOnThisLine.has(identifier)) {
            continue
          }
          
          usedVars.push({
            name: identifier,
            column: identMatch.index
          })
        }
        
        // Report undeclared variables
        usedVars.forEach(v => {
          issues.push({
            rule: "undeclared-variable",
            line: index + 1,
            column: v.column + 1,
            message: `Variable '${v.name}' used without declaration`,
            suggestion: "Declare the variable before using it",
            severity: "error"
          })
        })
      })
      
      // Remove duplicates
      const seen = new Set<string>()
      return issues.filter(issue => {
        const key = `${issue.line}-${issue.message}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }
  },
  
  // Rule 14: Missing semicolons
  {
    rule: "missing-semicolon",
    message: "Missing semicolon at end of statement",
    suggestion: "Add semicolon at the end of the statement",
    severity: "error",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        
        // Skip empty lines, comments, braces, and control structures
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || 
            trimmed.startsWith('*') || trimmed.startsWith('#') ||
            trimmed === '{' || trimmed === '}' ||
            trimmed.startsWith('if') || trimmed.startsWith('else') ||
            trimmed.startsWith('for') || trimmed.startsWith('while') ||
            trimmed.startsWith('do') || trimmed.startsWith('switch') ||
            trimmed.endsWith('{') || trimmed.endsWith('}')) {
          return
        }
        
        // Check if line looks like a statement that should end with semicolon
        // Pattern: assignment, return, function call, variable declaration, expression
        const needsSemicolon = /^(?:return\s+|[a-zA-Z_]\w*\s*=|[a-zA-Z_]\w*\s*\(|(?:int|float|double|char|bool|let|const|var)\s+[a-zA-Z_])/
        
        if (needsSemicolon.test(trimmed) && !trimmed.endsWith(';') && !trimmed.endsWith(',')) {
          issues.push({
            rule: "missing-semicolon",
            line: index + 1,
            column: line.length,
            message: "Missing semicolon at end of statement",
            suggestion: "Add semicolon at the end of the statement",
            severity: "error"
          })
        }
      })
      
      return issues
    }
  },
  
  // Rule 15: Trailing whitespace
  {
    rule: "trailing-whitespace",
    message: "Trailing whitespace at end of line",
    suggestion: "Remove trailing whitespace for cleaner code",
    severity: "info",
    check: (code: string, lines: string[]) => {
      const issues: CodeIssue[] = []
      
      lines.forEach((line, index) => {
        if (/\s+$/.test(line) && line.trim().length > 0) {
          issues.push({
            rule: "trailing-whitespace",
            line: index + 1,
            column: line.trimEnd().length + 1,
            message: "Trailing whitespace at end of line",
            suggestion: "Remove trailing whitespace for cleaner code",
            severity: "info"
          })
        }
      })
      
      return issues
    }
  }
]

/**
 * Analyze code and return issues
 */
export function analyzeCode(code: string): CodeIssue[] {
  const issues: CodeIssue[] = []
  const lines = code.split("\n")
  
  analysisRules.forEach((rule) => {
    try {
      const ruleIssues = rule.check(code, lines)
      issues.push(...ruleIssues)
    } catch (error) {
      console.error(`Rule ${rule.rule} failed:`, error)
    }
  })
  
  // Remove duplicate issues at the same location
  const uniqueIssues = issues.filter((issue, index, self) => 
    index === self.findIndex(i => 
      i.line === issue.line && i.column === issue.column && i.rule === issue.rule
    )
  )
  
  return uniqueIssues.sort((a, b) => a.line - b.line || a.column - b.column)
}

/**
 * Get code quality score (0-100)
 */
export function getCodeQualityScore(code: string): number {
  const issues = analyzeCode(code)
  const errorCount = issues.filter((i) => {
    const rule = analysisRules.find(r => r.rule === i.rule)
    return rule?.severity === "error"
  }).length
  const warningCount = issues.filter((i) => {
    const rule = analysisRules.find(r => r.rule === i.rule)
    return rule?.severity === "warning"
  }).length
  const infoCount = issues.filter((i) => {
    const rule = analysisRules.find(r => r.rule === i.rule)
    return rule?.severity === "info"
  }).length
  
  let score = 100
  score -= errorCount * 10
  score -= warningCount * 5
  score -= infoCount * 2
  
  return Math.max(0, score)
}

/**
 * Get suggestions for improving code
 */
export function getCodeSuggestions(code: string): string[] {
  const issues = analyzeCode(code)
  const suggestions = new Set<string>()
  
  issues.forEach((issue) => {
    suggestions.add(issue.suggestion)
  })
  
  return Array.from(suggestions)
}