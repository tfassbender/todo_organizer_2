package net.tfassbender.todo.dto;

public class TodoFileDto {

  public TodoFileDto(String filename, String content) {
    this.filename = filename;
    this.content = content;
  }

  public String filename;
  public String content;
  public String icon;
}
