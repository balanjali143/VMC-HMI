package com.primeform.vmc_operator_hmi.service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.primeform.vmc_operator_hmi.entity.Job;
import com.primeform.vmc_operator_hmi.entity.MachineCheck;
import com.primeform.vmc_operator_hmi.entity.OperationState;
import com.primeform.vmc_operator_hmi.entity.Tool;
import com.primeform.vmc_operator_hmi.entity.WorkpieceStep;
import com.primeform.vmc_operator_hmi.repository.JobRepository;
import com.primeform.vmc_operator_hmi.repository.MachineCheckRepository;
import com.primeform.vmc_operator_hmi.repository.OperationStateRepository;
import com.primeform.vmc_operator_hmi.repository.ToolRepository;
import com.primeform.vmc_operator_hmi.repository.WorkpieceStepRepository;

import jakarta.transaction.Transactional;

@Service
public class HmiService {
	private final JobRepository jobRepository;
	private final MachineCheckRepository machineCheckRepository;
	private final ToolRepository toolRepository;
	private final WorkpieceStepRepository workpieceStepRepository;
	private final OperationStateRepository operationStateRepository;

	public HmiService(JobRepository jobRepository, MachineCheckRepository machineCheckRepository,
			ToolRepository toolRepository, WorkpieceStepRepository workpieceStepRepository,
			OperationStateRepository operationStateRepository) {

		this.jobRepository = jobRepository;
		this.machineCheckRepository = machineCheckRepository;
		this.toolRepository = toolRepository;
		this.workpieceStepRepository = workpieceStepRepository;
		this.operationStateRepository = operationStateRepository;
	}

	public Map<String, Object> getState() {
		Map<String, Object> state = new LinkedHashMap<>();
		Job job = jobRepository.findAll().stream().findFirst().orElse(null);

		List<MachineCheck> checks = machineCheckRepository.findAllByOrderBySequenceNoAsc();
		List<Tool> tools = toolRepository.findAllByOrderBySequenceNoAsc();
		List<WorkpieceStep> workpieceSteps = workpieceStepRepository.findAllByOrderBySequenceNoAsc();
		String operationStatus = operationStateRepository.findAll().stream().findFirst().map(OperationState::getStatus)
				.orElse("Ready");
		long confirmedChecks = checks.stream().filter(MachineCheck::isConfirmed).count();
		long confirmedTools = tools.stream().filter(Tool::isConfirmed).count();
		long confirmedWorkpiece = workpieceSteps.stream().filter(WorkpieceStep::isConfirmed).count();
		String stage = calculateStage(checks, tools, workpieceSteps);
		state.put("job", job);
		state.put("machineChecks", checks);
		state.put("tools", tools);
		state.put("workpieceSteps", workpieceSteps);
		state.put("confirmedChecks", confirmedChecks);
		state.put("confirmedTools", confirmedTools);
		state.put("confirmedWorkpiece", confirmedWorkpiece);

		state.put("operationStatus", operationStatus);
		state.put("currentStage", stage);

		return state;
	}

	private String calculateStage(List<MachineCheck> checks, List<Tool> tools, List<WorkpieceStep> workpieceSteps) {

		boolean machineComplete = checks.stream().allMatch(MachineCheck::isConfirmed);

		boolean toolsComplete = tools.stream().allMatch(Tool::isConfirmed);

		boolean workpieceComplete = workpieceSteps.stream().allMatch(WorkpieceStep::isConfirmed);

		if (!machineComplete) {
			return "MACHINE";
		}

		if (!toolsComplete) {
			return "TOOLS";
		}

		if (!workpieceComplete) {
			return "WORKPIECE";
		}

		return "READY";
	}

	@Transactional
	public void confirmMachineCheck(Long id) {

		MachineCheck check = machineCheckRepository.findById(id).orElseThrow();

		check.setConfirmed(true);

		machineCheckRepository.save(check);
	}

	@Transactional
	public void confirmTool(Long id) {

		Tool tool = toolRepository.findById(id).orElseThrow();

		tool.setConfirmed(true);

		toolRepository.save(tool);
	}

	@Transactional
	public void confirmWorkpieceStep(Long id) {

		WorkpieceStep step = workpieceStepRepository.findById(id).orElseThrow();

		step.setConfirmed(true);

		workpieceStepRepository.save(step);
	}

	public boolean canStartOperation() {

		boolean machineComplete = machineCheckRepository.findAll().stream().allMatch(MachineCheck::isConfirmed);

		boolean toolsComplete = toolRepository.findAll().stream().allMatch(Tool::isConfirmed);

		boolean workpieceComplete = workpieceStepRepository.findAll().stream().allMatch(WorkpieceStep::isConfirmed);

		return machineComplete && toolsComplete && workpieceComplete;
	}

	@Transactional
	public String startOperation() {

		if (!canStartOperation()) {
			throw new IllegalStateException("All machine, tool and workpiece checks must be completed.");
		}

		OperationState state = operationStateRepository.findAll().stream().findFirst().orElse(new OperationState());

		state.setStatus("RUNNING");
		state.setUpdatedAt(LocalDateTime.now());

		operationStateRepository.save(state);

		return "RUNNING";
	}

	@Transactional
	public String stopOperation() {

	    OperationState state =
	            operationStateRepository
	                .findTopByOrderByIdDesc()
	                .orElseThrow(
	                    () -> new IllegalStateException(
	                        "Operation state not found"
	                    )
	                );

	    state.setStatus("STOPPED");

	    state.setUpdatedAt(
	        LocalDateTime.now()
	    );

	    operationStateRepository.save(state);

	    return "STOPPED";
	}

}
