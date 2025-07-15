package net.tfassbender.todo.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Stream;

@ApplicationScoped
public class TodoService {

  private static final String FILE_EXTENSION = ".todo";

  @ConfigProperty(name = "todos.path")
  private String todosPath;

  public List<String> listTodoFiles() throws IOException {
    Path path = Paths.get(todosPath);

    if (!Files.exists(path) || !Files.isDirectory(path)) {
      throw new IOException("Invalid recipes path: " + path.toAbsolutePath());
    }

    try (Stream<Path> files = Files.list(path)) {
      return files.filter(Files::isRegularFile).filter(p -> p.getFileName().toString().toLowerCase().endsWith(FILE_EXTENSION)).map(p -> p.getFileName().toString()).map(name -> name.substring(0, name.length() - FILE_EXTENSION.length())).sorted().toList();
    }
  }

  public String readTodoFile(String filename) throws IOException {
    Path path = Paths.get(todosPath, filename + FILE_EXTENSION);

    if (!Files.exists(path) || !Files.isRegularFile(path)) {
      throw new IOException("File not found: " + path.toAbsolutePath());
    }

    return Files.readString(path);
  }
}
