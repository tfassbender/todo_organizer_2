package net.tfassbender.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Stream;

@ApplicationScoped
public class RecipesService {

    @ConfigProperty(name = "recipes.path")
    private String recipesPath;

    public List<String> listRecipeFiles() throws IOException {
        Path path = Paths.get(recipesPath);

        if (!Files.exists(path) || !Files.isDirectory(path)) {
            throw new IOException("Invalid recipes path: " + path.toAbsolutePath());
        }

        try (Stream<Path> files = Files.list(path)) {
            return files
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().toLowerCase().endsWith(".txt"))
                    .map(p -> p.getFileName().toString())
                    .map(name -> name.substring(0, name.length() - ".txt".length()))
                    .sorted()
                    .toList();
        }
    }

    public String readRecipeFile(String filename) throws IOException {
        Path path = Paths.get(recipesPath, filename + ".txt");

        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            throw new IOException("File not found: " + path.toAbsolutePath());
        }

        return Files.readString(path);
    }
}
