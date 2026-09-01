package com.primeform.vmc_operator_hmi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.primeform.vmc_operator_hmi.entity.WorkpieceStep;
@Repository
public interface WorkpieceStepRepository extends JpaRepository<WorkpieceStep, Long> {
	 List<WorkpieceStep> findAllByOrderBySequenceNoAsc();

}
