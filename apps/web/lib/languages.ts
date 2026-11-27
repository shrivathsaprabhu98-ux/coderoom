export const LANGUAGES = {
  python: {
    label: "Python",
    monaco: "python",
    starter: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("CodeRoom"))\n',
  },
  javascript: {
    label: "JavaScript",
    monaco: "javascript",
    starter: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("CodeRoom"));\n',
  },
  java: {
    label: "Java",
    monaco: "java",
    starter:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeRoom!");\n    }\n}\n',
  },
  cpp: {
    label: "C++",
    monaco: "cpp",
    starter:
      '#include <iostream>\n\nint main() {\n    std::cout << "Hello, CodeRoom!" << std::endl;\n    return 0;\n}\n',
  },
  c: {
    label: "C",
    monaco: "c",
    starter: '#include <stdio.h>\n\nint main() {\n    printf("Hello, CodeRoom!\\n");\n    return 0;\n}\n',
  },
} as const;

export type LanguageId = keyof typeof LANGUAGES;