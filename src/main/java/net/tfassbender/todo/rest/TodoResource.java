package net.tfassbender.todo.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.tfassbender.todo.dto.TodoFileDto;
import net.tfassbender.todo.service.TodoService;

import java.io.IOException;
import java.util.List;

@Path("/todos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TodoResource {

  @Inject
  private TodoService service;

  @GET
  public Response listTodos() {
    try {
      List<TodoFileDto> files = service.listTodoFiles();
      return Response.ok(files).build();
    }
    catch (IOException e) {
      return Response.serverError().entity("Failed to read todos: " + e.getMessage()).build();
    }
  }

  @GET
  @Path("/{filename}")
  public Response getTodo(@PathParam("filename") String filename) {
    try {
      TodoFileDto content = service.readTodoFile(filename);
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
      service.saveTodoFile(new TodoFileDto(filename, content));
      return Response.ok().build();
    }
    catch (IOException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Failed to save todo: " + e.getMessage()).build();
    }
  }
}