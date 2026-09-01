package com.primeform.vmc_operator_hmi.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {
     @Id
     @GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long Id;
	private String operationName;
	private Integer quantity;
	private String material;
	private String drawingRevision;
	private String cncProgram;
	private String fixture;
	private String workOffset;

}
