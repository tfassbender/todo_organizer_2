package net.tfassbender.todo.startup;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import net.tfassbender.todo.service.SettingsService;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@ApplicationScoped
public class TodoStartupInitializer {

  private static final Logger log = LoggerFactory.getLogger(TodoStartupInitializer.class);

  @ConfigProperty(name = "todos.path")
  private String todosPath;

  @Inject
  private SettingsService settingsService;

  void onStartup(@Observes StartupEvent startupEvent) {
    Path todosDir = Paths.get(todosPath);
    Path todosSettingsDir = todosDir.resolve(".settings");

    createDirectory(todosDir);
    createDirectory(todosSettingsDir);
    createInitialSettingsFile(todosSettingsDir);
  }

  private void createDirectory(Path directory) {
    try {
      if (Files.notExists(directory)) {
        Files.createDirectories(directory);
        log.info("Created directory at: {}", directory.toAbsolutePath());
      }
      else {
        log.info("Directory already exists: {}", directory.toAbsolutePath());
      }
    }
    catch (IOException e) {
      log.error("Failed to create directory: {}", e.getMessage());
    }
  }

  private void createInitialSettingsFile(Path settingsDir) {
    settingsService.getSettings(); // will load settings from file or create a new settings object
    settingsService.saveSettings(); // stores the loaded or newly created settings object to the file
  }
}
