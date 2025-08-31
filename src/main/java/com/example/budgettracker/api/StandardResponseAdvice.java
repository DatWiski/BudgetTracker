package com.example.budgettracker.api;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
public class StandardResponseAdvice implements ResponseBodyAdvice<Object> {
  @Override
  public boolean supports(
      @NonNull MethodParameter returnType,
      @NonNull Class<? extends HttpMessageConverter<?>> converterType) {
    return true;
  }

  @Override
  public Object beforeBodyWrite(
      @Nullable Object body,
      @NonNull MethodParameter returnType,
      @NonNull MediaType selectedContentType,
      @NonNull Class<? extends HttpMessageConverter<?>> selectedConverterType,
      @NonNull ServerHttpRequest request,
      @NonNull ServerHttpResponse response) {
    // Only wrap JSON responses
    if (!MediaType.APPLICATION_JSON.includes(selectedContentType)) {
      return body;
    }
    if (body == null) {
      return ApiResponse.ok(null);
    }
    if (body instanceof ApiResponse<?> api) {
      return api;
    }
    if (body instanceof ResponseEntity<?> re) {
      Object b = re.getBody();
      if (b instanceof ApiResponse<?>) {
        return re;
      }
      return ResponseEntity.status(re.getStatusCode())
          .headers(re.getHeaders())
          .body(ApiResponse.ok(b));
    }
    if (body instanceof String) {
      return body; // avoid StringHttpMessageConverter issues
    }
    return ApiResponse.ok(body);
  }
}
