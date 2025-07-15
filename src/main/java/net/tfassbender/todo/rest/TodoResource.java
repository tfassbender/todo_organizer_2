package net.tfassbender.todo.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.tfassbender.todo.analyzer.TodoFileAnalyzer;
import net.tfassbender.todo.dto.TodoFileDto;
import net.tfassbender.todo.service.SettingsService;
import net.tfassbender.todo.service.TodoService;

import java.io.IOException;
import java.util.List;

@Path("/todos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TodoResource {

  @Inject
  private TodoService todoService;

  @Inject
  private SettingsService settingsService;

  @GET
  public Response listTodos() {
    try {
      List<TodoFileDto> files = todoService.listTodoFiles();
      return Response.ok(files).build();
    }
    catch (IOException e) {
      return Response.serverError().entity("Failed to read todos: " + e.getMessage()).build();
    }
  }

  @GET
  @Path("/opened")
  public Response listOpenedTodos() {
    try {
      List<String> openedFiles = settingsService.getSettings().openedFiles;
      if (openedFiles == null || openedFiles.isEmpty()) {
        return Response.ok(List.of()).build(); // Return empty list if no files are opened
      }

      List<TodoFileDto> todos = todoService.listTodoFiles();
      List<TodoFileDto> openedTodos = todos.stream().filter(todo -> openedFiles.contains(todo.filename)).toList();

      return Response.ok(openedTodos).build();
    }
    catch (IOException e) {
      return Response.serverError().entity("Failed to read opened todos: " + e.getMessage()).build();
    }
  }

  @GET
  @Path("/{filename}")
  public Response getTodo(@PathParam("filename") String filename) {
    try {
      TodoFileDto content = todoService.readTodoFile(filename);
      return Response.ok(content).build();
    }
    catch (IOException e) {
      return Response.status(Response.Status.NOT_FOUND).entity("Todo not found: " + e.getMessage()).build();
    }
  }

  @PUT
  @Path("/{filename}")
  @Consumes(MediaType.TEXT_PLAIN)
  public Response saveTodo(@PathParam("filename") String filename, String content) {
    try {
      TodoFileDto dto = new TodoFileDto(filename, content);
      todoService.saveTodoFile(dto);
      TodoFileAnalyzer.addIcon(dto); // analyze the icon to send it back updated
      dto.content = null; // Clear content to avoid sending it back
      return Response.ok(dto).build();
    }
    catch (IOException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Failed to save todo: " + e.getMessage()).build();
    }
  }
}
