package com.organice.controller;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(
            @RequestBody Map<String, Object> body) throws Exception {

        Stripe.apiKey = "sk_test_51TIFI3PSYJgdv7vvsxmjG75JNJomNxvU8TikterZhm8xf1qOhMihamCYxRqQoSB9mTnjtmM3ht7oR5JlsHv";

        Long monto = Long.valueOf(body.get("monto").toString());

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(monto)
                .setCurrency("mxn")
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        return ResponseEntity.ok(Map.of("clientSecret", intent.getClientSecret()));
    }
}
