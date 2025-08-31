package com.example.budgettracker.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
public class JwtKeyConfig {

  @Value("${app.jwt.key-file:jwt-key.json}")
  private String keyFilePath;

  @Bean
  public RSAKey rsaKey() {
    try {
      Path keyFile = Paths.get(keyFilePath);

      if (Files.exists(keyFile)) {
        // Load existing key
        return loadKeyFromFile(keyFile);
      } else {
        // Generate new key and save it
        return generateAndSaveNewKey(keyFile);
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to initialize JWT RSA key", e);
    }
  }

  private RSAKey loadKeyFromFile(Path keyFile) throws Exception {
    String keyJson = Files.readString(keyFile);
    return RSAKey.parse(keyJson);
  }

  private RSAKey generateAndSaveNewKey(Path keyFile) throws Exception {
    // Generate new RSA key pair
    KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
    keyPairGenerator.initialize(2048);
    KeyPair keyPair = keyPairGenerator.generateKeyPair();

    RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
    RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();

    // Create RSA key with ID
    RSAKey rsaKey =
        new RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .keyID("jwt-key-" + System.currentTimeMillis())
            .build();

    // Save to file
    Files.writeString(keyFile, rsaKey.toJSONString());

    System.out.println("Generated new JWT signing key and saved to: " + keyFilePath);

    return rsaKey;
  }

  @Bean
  public JwtEncoder jwtEncoder() {
    JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(rsaKey()));
    return new NimbusJwtEncoder(jwks);
  }

  @Bean
  public JwtDecoder jwtDecoder() {
    try {
      return NimbusJwtDecoder.withPublicKey(rsaKey().toRSAPublicKey()).build();
    } catch (Exception e) {
      throw new RuntimeException("Failed to create JWT decoder", e);
    }
  }
}
