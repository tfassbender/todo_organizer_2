package net.tfassbender.todo.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Contains setting information like which files are opened (persisted for on startup)
 */
public class TodoSettingsDto {

  public List<String> openedFiles = new ArrayList<>();
}
