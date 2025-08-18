package net.tfassbender.todo.rest;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.Config;

import java.util.Set;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class AuthenticationFilter implements ContainerRequestFilter {

    @Inject
    private Config config;

    private static final Set<String> UNPROTECTED_PATHS = Set.of("/auth/login", "/todos/version");

    @Override
    public void filter(ContainerRequestContext requestContext) {
        String configuredPassword = config.getOptionalValue("todo.auth.password", String.class).orElse(null);

        // If no password is set, allow everything
        if (configuredPassword == null || configuredPassword.isBlank()) {
            return;
        }

        String path = requestContext.getUriInfo().getPath();
        if (UNPROTECTED_PATHS.contains(path)) {
            return; // Skip auth for allowed endpoints
        }

        // Check cookie
        Cookie cookie = requestContext.getCookies().get("auth_token");
        if (cookie == null || !configuredPassword.equals(cookie.getValue())) {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
        }
    }
}
