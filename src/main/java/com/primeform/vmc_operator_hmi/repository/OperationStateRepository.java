package com.primeform.vmc_operator_hmi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.primeform.vmc_operator_hmi.entity.OperationState;

@Repository
public interface OperationStateRepository extends JpaRepository<OperationState, Long> {

	Optional<OperationState> findTopByOrderByIdDesc();
}
