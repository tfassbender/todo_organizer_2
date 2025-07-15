package net.tfassbender.todo.dto;

public class TodoFileDto {

  public TodoFileDto() {
    // Default constructor for JSON deserialization
  }

  public TodoFileDto(String filename) {
    this.filename = filename;
  }

  public TodoFileDto(String filename, String content) {
    this.filename = filename;
    this.content = content;
  }

  public String filename;
  public String content;
}
