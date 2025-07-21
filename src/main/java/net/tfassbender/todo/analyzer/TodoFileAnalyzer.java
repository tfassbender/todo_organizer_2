package net.tfassbender.todo.analyzer;

import net.tfassbender.todo.dto.TodoFileDto;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Analyzes file to add metadata like icons.
 */
public class TodoFileAnalyzer {

  private enum TodoIcon {
    TODO("icon_todo_small.png"), //
    DONE("icon_done_small.png"), //
    QUESTION("icon_question_small.png"), //
    IMPORTANT("icon_important_small.png");

    public final String iconPath;

    private TodoIcon(String iconPath) {
      this.iconPath = iconPath;
    }
  }

  private enum LineType {
    HEADLINE, //
    TODO, //
    DONE, //
    QUESTION, //
    IMPORTANT, //
    COMMENT, //
    RESULT, //
    STRUCK, //
    STRUCK_COMMENT, //
    EMPTY;
  }

  private TodoFileAnalyzer() {}

  public static TodoFileDto addIcon(TodoFileDto todoFileDto) {
    Set<LineType> lineTypes = analyzeLines(todoFileDto.content).stream().map(TodoLine::getType).collect(Collectors.toSet());
    if (lineTypes.contains(LineType.IMPORTANT)) {
      todoFileDto.icon = TodoIcon.IMPORTANT.iconPath;
    }
    else if (lineTypes.contains(LineType.QUESTION)) {
      todoFileDto.icon = TodoIcon.QUESTION.iconPath;
    }
    else if (lineTypes.contains(LineType.TODO)) {
      todoFileDto.icon = TodoIcon.TODO.iconPath;
    }
    else {
      todoFileDto.icon = TodoIcon.DONE.iconPath;
    }

    return todoFileDto;
  }

  private static List<TodoLine> analyzeLines(String content) {
    List<TodoLine> lines = new ArrayList<>();
    String[] splitLines = content.split("\n");

    for (int i = 0; i < splitLines.length; i++) {
      String line = splitLines[i];
      LineType type = determineLineType(line);
      lines.add(new TodoLine(type, i + 1));
    }

    return lines;
  }

  private static LineType determineLineType(String line) {
    if (line == null || line.trim().isEmpty()) {
      return LineType.EMPTY;
    }

    if (line.matches("^#{1,4}\\s.*")) {
      return LineType.HEADLINE;
    }
    // Prefixes (ignore leading whitespace)
    else if (line.matches("^\\s*!.*")) {
      return LineType.IMPORTANT;
    }
    else if (line.matches("^\\s*\\?.*")) {
      return LineType.QUESTION;
    }
    else if (line.matches("^\\s*//-.*")) {
      return LineType.STRUCK_COMMENT;
    }
    else if (line.matches("^\\s*//\\s.*")) {
      return LineType.COMMENT;
    }
    else if (line.matches("^\\s*/\\s.*")) {
      return LineType.DONE;
    }
    else if (line.matches("^\\s*>.*")) {
      return LineType.RESULT;
    }
    else if (line.matches("^\\s*/-.*")) {
      return LineType.STRUCK;
    }

    return LineType.TODO;
  }

  private static class TodoLine {

    public LineType type;
    public int lineNumber;

    public TodoLine(LineType type, int lineNumber) {
      this.type = type;
      this.lineNumber = lineNumber;
    }

    public LineType getType() {
      return type;
    }
  }
}
