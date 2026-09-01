package com.primeform.vmc_operator_hmi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.primeform.vmc_operator_hmi.entity.Job;
@Repository
public interface JobRepository extends JpaRepository<Job,Long> {

}
