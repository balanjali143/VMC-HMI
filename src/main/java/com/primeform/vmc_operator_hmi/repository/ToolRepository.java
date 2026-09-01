package com.primeform.vmc_operator_hmi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.primeform.vmc_operator_hmi.entity.Tool;
@Repository
public interface ToolRepository extends JpaRepository<Tool,Long> {
	List<Tool> findAllByOrderBySequenceNoAsc();
}
