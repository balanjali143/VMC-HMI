package com.primeform.vmc_operator_hmi.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

@Configuration
public class DataInitializer {
	@Bean
	CommandLineRunner loadData(JobRepository jobRepository, MachineCheckRepository machineCheckRepository,
			ToolRepository toolRepository, WorkpieceStepRepository workpieceStepRepository,
			OperationStateRepository operationStateRepository) {

		return args -> {

			// -------------------------
			// JOB
			// -------------------------

			if (jobRepository.count() == 0) {

				Job job = new Job();

				job.setOperationName("Aluminum Pocket Milling");

				job.setQuantity(10);

				job.setMaterial("Aluminum 6061-T6");

				job.setDrawingRevision("Rev B");

				job.setCncProgram("AL6061_POCKET_REV_B.nc");

				job.setFixture("4-Jaw VMC Fixture");

				job.setWorkOffset("G54");

				jobRepository.save(job);
			}

			// -------------------------
			// MACHINE CHECKS
			// -------------------------

			if (machineCheckRepository.count() == 0) {

				createCheck(machineCheckRepository, "Power / Control Available", 1);

				createCheck(machineCheckRepository, "E-Stop Released", 2);

				createCheck(machineCheckRepository, "Guard / Door Closed", 3);

				createCheck(machineCheckRepository, "No Active Alarm", 4);

				createCheck(machineCheckRepository, "Lubrication / Coolant Ready", 5);

				createCheck(machineCheckRepository, "Reference Return Complete", 6);
			}

			// -------------------------
			// TOOLS
			// -------------------------

			if (toolRepository.count() == 0) {

				createTool(toolRepository, "T01", "Ø10 mm Face Mill", "Facing", 1);

				createTool(toolRepository, "T02", "Ø8 mm End Mill", "Pocket Milling", 2);

				createTool(toolRepository, "T03", "Ø6 mm Drill", "Hole Drilling", 3);

				createTool(toolRepository, "T04", "Ø6 mm Chamfer Mill", "Chamfering", 4);
			}

			// -------------------------
			// WORKPIECE
			// -------------------------

			if (workpieceStepRepository.count() == 0) {

				createWorkpieceStep(workpieceStepRepository,
						"Place the workpiece with the machined reference face upward.", 1);

				createWorkpieceStep(workpieceStepRepository, "Secure the workpiece using the 4-Jaw VMC Fixture.", 2);

				createWorkpieceStep(workpieceStepRepository, "Verify workpiece material: Aluminum 6061-T6.", 3);

				createWorkpieceStep(workpieceStepRepository, "Verify drawing revision: Rev B.", 4);

				createWorkpieceStep(workpieceStepRepository, "Set and verify work offset: G54.", 5);
			}

			// -------------------------
			// OPERATION STATE
			// -------------------------

			if (operationStateRepository.count() == 0) {

				OperationState state = new OperationState();

				state.setStatus("READY");

				state.setUpdatedAt(LocalDateTime.now());

				operationStateRepository.save(state);
			}
		};
	}

	private void createCheck(MachineCheckRepository repository, String description, int sequence) {

		MachineCheck check = new MachineCheck();

		check.setDescription(description);
		check.setSequenceNo(sequence);
		check.setConfirmed(false);

		repository.save(check);
	}

	private void createTool(ToolRepository repository, String number, String type, String purpose, int sequence) {

		Tool tool = new Tool();

		tool.setToolNumber(number);
		tool.setToolType(type);
		tool.setPurpose(purpose);
		tool.setSequenceNo(sequence);
		tool.setConfirmed(false);

		repository.save(tool);
	}

	private void createWorkpieceStep(WorkpieceStepRepository repository, String instruction, int sequence) {

		WorkpieceStep step = new WorkpieceStep();

		step.setInstruction(instruction);
		step.setSequenceNo(sequence);
		step.setConfirmed(false);

		repository.save(step);
	}

}
