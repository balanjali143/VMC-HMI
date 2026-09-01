package com.primeform.vmc_operator_hmi.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.primeform.vmc_operator_hmi.service.HmiService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HmiController {

    private final HmiService hmiService;

    public HmiController(HmiService hmiService) {
        this.hmiService = hmiService;
    }

    // =========================
    // GET HMI STATE
    // =========================

    @GetMapping("/state")
    public ResponseEntity<?> getState() {

        return ResponseEntity.ok(
                hmiService.getState()
        );
    }

    // =========================
    // MACHINE CHECK
    // =========================

    @PostMapping("/checks/{id}/confirm")
    public ResponseEntity<?> confirmCheck(
            @PathVariable Long id) {

        try {

            hmiService.confirmMachineCheck(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Machine check confirmed"
                    )
            );

        } catch (IllegalStateException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            );
        }
    }

    // =========================
    // TOOL
    // =========================

    @PostMapping("/tools/{id}/confirm")
    public ResponseEntity<?> confirmTool(
            @PathVariable Long id) {

        try {

            hmiService.confirmTool(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Tool confirmed"
                    )
            );

        } catch (IllegalStateException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            );
        }
    }

    // =========================
    // WORKPIECE
    // =========================

    @PostMapping("/workpiece/{id}/confirm")
    public ResponseEntity<?> confirmWorkpiece(
            @PathVariable Long id) {

        try {

            hmiService.confirmWorkpieceStep(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Workpiece step confirmed"
                    )
            );

        } catch (IllegalStateException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            );
        }
    }

    // =========================
    // START OPERATION
    // =========================

    @PostMapping("/operation/start")
    public ResponseEntity<?> startOperation() {

        try {

            String status =
                    hmiService.startOperation();

            return ResponseEntity.ok(
                    Map.of(
                            "status",
                            status
                    )
            );

        } catch (IllegalStateException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            );
        }
    }
    @PostMapping("/power-on")
    public ResponseEntity<?> powerOn() {

        return ResponseEntity.ok(
            Map.of(
                "status", "POWERED_ON",
                "message", "Machine powered on"
            )
        );
    }

    // =========================
    // STOP OPERATION
    // =========================

    @PostMapping("/operation/stop")
    public ResponseEntity<?> stopOperation() {

        try {

            String status =
                    hmiService.stopOperation();

            return ResponseEntity.ok(
                    Map.of(
                            "status",
                            status
                    )
            );

        } catch (IllegalStateException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            );
        }
    }
}