package net.tfassbender.todo.dto;

public class ErrorResponseDto {

  public String errorMessage;

  public ErrorResponseDto(String errorMessage) {
    this.errorMessage = errorMessage;
  }
}
