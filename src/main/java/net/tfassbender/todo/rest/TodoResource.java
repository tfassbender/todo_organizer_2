package net.tfassbender.todo.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.tfassbender.todo.analyzer.TodoFileAnalyzer;
import net.tfassbender.todo.dto.ErrorResponseDto;
import net.tfassbender.todo.dto.TodoFileDto;
import net.tfassbender.todo.dto.TodoSettingsDto;
import net.tfassbender.todo.service.SettingsService;
import net.tfassbender.todo.service.TodoService;

import java.io.IOException;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/todos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TodoResource {

  @Inject
  private TodoService todoService;

  @Inject
  private SettingsService settingsService;

  @GET
  public Response listTodos(@QueryParam("no-content") boolean noContent) {
    try {
      List<TodoFileDto> files = todoService.listTodoFiles();
      if (noContent) {
        // clear the content of each file
        files.forEach(file -> file.content = null);
      }

      return Response.ok(files).build();
    }
    catch (IOException e) {
      return Response.serverError().entity(new ErrorResponseDto("Failed to read todos: " + e.getMessage())).build();
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
      List<TodoFileDto> openedTodos = filterAndSortTodos(todos, openedFiles);

      return Response.ok(openedTodos).build();
    }
    catch (IOException e) {
      return Response.serverError().entity(new ErrorResponseDto("Failed to read opened todos: " + e.getMessage())).build();
    }
  }

  private static List<TodoFileDto> filterAndSortTodos(List<TodoFileDto> todos, List<String> openedFiles) {
    // Create a map from filename to its index for quick lookup
    Map<String, Integer> filenameOrder = new HashMap<>();
    for (int i = 0; i < openedFiles.size(); i++) {
      filenameOrder.put(openedFiles.get(i), i);
    }

    // Filter and sort based on index in openedFiles
    return todos.stream() //
            .filter(todo -> openedFiles.contains(todo.filename)) //
            .sorted(Comparator.comparingInt(todo -> filenameOrder.getOrDefault(todo.filename, Integer.MAX_VALUE))) //
            .toList();
  }

  @GET
  @Path("/{filename}")
  public Response getTodoFile(@PathParam("filename") String filename) {
    try {
      TodoFileDto dto = todoService.readTodoFile(filename);
      TodoFileAnalyzer.addIcon(dto);
      return Response.ok(dto).build();
    }
    catch (IOException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponseDto("Todo not found: " + e.getMessage())).build();
    }
  }

  @POST
  @Path("/opened/{filename}")
  public Response openTodoFile(@PathParam("filename") String filename) {
    try {
      TodoFileDto dto = todoService.readTodoFile(filename);
      TodoFileAnalyzer.addIcon(dto);

      settingsService.getSettings().openedFiles.add(filename);
      settingsService.saveSettings();

      return Response.ok(dto).build();
    }
    catch (IOException e) {
      return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponseDto("Todo file to open not found: " + e.getMessage())).build();
    }
  }

  @PUT
  @Path("/{filename}")
  @Consumes(MediaType.TEXT_PLAIN)
  public Response updateTodo(@PathParam("filename") String filename, String content) {
    if (!todoService.todoFileExists(filename)) {
      return Response.status(Response.Status.NOT_FOUND) //
              .entity(new ErrorResponseDto("Todo file to update not found: " + filename + " - use POST to create a new one.")) //
              .build();
    }

    try {
      TodoFileDto dto = todoService.readTodoFile(filename);
      dto.content = content;

      todoService.saveTodoFile(dto);
      TodoFileAnalyzer.addIcon(dto); // analyze the icon to send it back updated

      return Response.ok(dto).build();
    }
    catch (IOException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponseDto("Failed to update todo: " + e.getMessage())).build();
    }
  }

  @POST
  @Path("/{filename}")
  public Response createTodo(@PathParam("filename") String filename) {
    if (filename == null || filename.isBlank()) {
      return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponseDto("Filename must not be empty")).build();
    }
    if (todoService.todoFileExists(filename)) {
      return Response.status(Response.Status.CONFLICT).entity(new ErrorResponseDto("Todo file already exists: " + filename)).build();
    }

    try {
      TodoFileDto dto = new TodoFileDto(filename, "# " + filename + "\n\n<add a todo here>\n");
      todoService.saveTodoFile(dto);
      TodoFileAnalyzer.addIcon(dto);

      // add the new file to the opened files in settings
      TodoSettingsDto settings = settingsService.getSettings();
      settings.openedFiles.add(filename);
      settingsService.saveSettings();

      return Response.status(Response.Status.CREATED).entity(dto).build();
    }
    catch (IOException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponseDto("Failed to create todo: " + e.getMessage())).build();
    }
  }
}
