package net.tfassbender.todo.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.Config;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Map;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthenticationResource {
    @Inject
    private Config config;

    @POST
    @Path("/login")
    public Response login(Map<String, String> request) {
        String configuredPassword = config.getOptionalValue("todo.auth.password", String.class).orElse(null);
        String providedPassword = request.get("password");

        if (configuredPassword == null || configuredPassword.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Password auth is not enabled").build();
        }

        if (configuredPassword.equals(providedPassword)) {
            String cookieHeader = "auth_token=" + providedPassword + "; Path=/; HttpOnly";
            return Response.ok()
                    .header("Set-Cookie", cookieHeader)
                    .build();
        }
        else {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
    }

    @POST
    @Path("/logout")
    public Response logout() {
        String cookieHeader = "auth_token=; Path=/; HttpOnly; Max-Age=0";
        return Response.ok().header("Set-Cookie", cookieHeader).build();
    }
}