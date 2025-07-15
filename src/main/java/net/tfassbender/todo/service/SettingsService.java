package net.tfassbender.todo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import net.tfassbender.todo.dto.TodoSettingsDto;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

@ApplicationScoped
public class SettingsService {

  private static final Logger log = LoggerFactory.getLogger(SettingsService.class);

  private static final String SETTINGS_FILE = ".settings/todo-settings.json";

  @ConfigProperty(name = "todos.path")
  private String todosPath;

  private final ObjectMapper objectMapper = new ObjectMapper();

  private TodoSettingsDto settings;

  public TodoSettingsDto getSettings() {
    if (settings == null) {
      settings = loadSettings();
    }
    return settings;
  }

  private TodoSettingsDto loadSettings() {
    File settingsFile = new File(todosPath, SETTINGS_FILE);

    if (settingsFile.exists()) {
      try {
        return objectMapper.readValue(settingsFile, TodoSettingsDto.class);
      }
      catch (Exception e) {
        log.error("Failed to load settings from {}", settingsFile.getAbsolutePath(), e);
      }
    }

    return new TodoSettingsDto();
  }

  public void saveSettings() {
    File settingsFile = new File(todosPath, SETTINGS_FILE);

    try {
      objectMapper.writerWithDefaultPrettyPrinter().writeValue(settingsFile, settings);
      log.debug("Settings saved to {}", settingsFile.getAbsolutePath());
    }
    catch (Exception e) {
      log.error("Failed to save settings to {}", settingsFile.getAbsolutePath(), e);
    }
  }
}
