package com.example.accountmicroservice.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF koruması devre dışı
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Tüm endpoint'ler erişime açık
                )
                .httpBasic(Customizer.withDefaults()); // Basit HTTP erişimi

        return http.build();
    }
}
