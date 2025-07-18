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