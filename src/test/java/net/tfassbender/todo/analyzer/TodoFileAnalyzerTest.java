package net.tfassbender.todo.analyzer;

import net.tfassbender.todo.dto.TodoFileDto;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TodoFileAnalyzerTest {

  @Test
  void testAddIcon_done() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", """
            # asdf
            
            // <add a todo here>
            
            ### something
            / asdf
            """));

    assertEquals("icon_done_small.png", dto.icon);
  }

  @Test
  void testAddIcon_todo() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", """
            # asdf
            
            // <add a todo here>
            
            ### something
            asdf
            """));

    assertEquals("icon_todo_small.png", dto.icon);
  }

  @Test
  void testAddIcon_question() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", """
            # asdf
            
            // <add a todo here>
            
            ### something
            ? asdf
            """));

    assertEquals("icon_question_small.png", dto.icon);
  }

  @Test
  void testAddIcon_important() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", """
            # asdf
            
            // <add a todo here>
            
            ### something
            ! asdf
            """));

    assertEquals("icon_important_small.png", dto.icon);
  }

  @Test
  void testAddIcon_emptyComment() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", "# asdf\n" //
            + "   // <add a todo here>\n"  //
            + "// \n" //
            + "   \n" //
            + "### something\n" //
            + "/ asdf"));

    assertEquals("icon_done_small.png", dto.icon);
  }

  @Test
  void testAddIcon_prefixesWithoutText_done() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", "# \n" //
            + "// \n" //
            + " \t// \n" //
            + "/ \n" //
            + " \t/ \n" //
            + "/- \n" //
            + " \t/- \n" //
    ));

    assertEquals("icon_done_small.png", dto.icon);
  }

  @Test
  void testAddIcon_prefixesWithoutText_important() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", "! \n"));
    assertEquals("icon_important_small.png", dto.icon);

    dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", " \t! \n"));
    assertEquals("icon_important_small.png", dto.icon);
  }

  @Test
  void testAddIcon_prefixesWithoutText_question() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", "? \n"));
    assertEquals("icon_question_small.png", dto.icon);

    dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", " \t? \n"));
    assertEquals("icon_question_small.png", dto.icon);
  }

  @Test
  void testAddIcon_leadingWhitespaces_done() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", "# for headlines leading whitespaces are not allowed" //
            + " \t// comment\n" //
            + " \t/ done\n" //
            + " \t/- struck\n" //
    ));

    assertEquals("icon_done_small.png", dto.icon);
  }

  @Test
  void testAddIcon_leadingWhitespaces_important() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", " \t! important"));
    assertEquals("icon_important_small.png", dto.icon);
  }

  @Test
  void testAddIcon_leadingWhitespaces_question() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", " \t? question"));
    assertEquals("icon_question_small.png", dto.icon);
  }

  @Test
  void testAddIcon_empty() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", ""));

    assertEquals("icon_done_small.png", dto.icon);
  }

  @Test
  void testAddIcon_wrongHeadlineFormat() {
    TodoFileDto dto = TodoFileAnalyzer.addIcon(new TodoFileDto("todo_file", "##### only four hashes are interpreted as headline"));

    assertEquals("icon_todo_small.png", dto.icon);
  }
}