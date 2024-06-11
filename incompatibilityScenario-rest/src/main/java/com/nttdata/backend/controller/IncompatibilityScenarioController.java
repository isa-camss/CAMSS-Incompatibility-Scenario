
package com.nttdata.backend.controller;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nttdata.backend.beans.ApiError;
import com.nttdata.backend.beans.Assessment;
import com.nttdata.backend.beans.Compare;
import com.nttdata.backend.beans.Criteria;
import com.nttdata.backend.beans.Environment;
import com.nttdata.backend.beans.SBB;
import com.nttdata.backend.exceptions.ErrorFormatXMLException;
import com.nttdata.backend.exceptions.ErrorNullContentXMLException;
import com.nttdata.backend.repository.IncompatibilityScenarioRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

/**
 * Backend controller
 */

@RestController
public class IncompatibilityScenarioController {
	
	/**
	 * Variable to write log
	 */
	private Logger log = LogManager.getLogger(getClass());
		
	@Autowired
	private IncompatibilityScenarioRepository assessmentRepository;
	
	@Operation(summary  = "Get a assessment", description  = "Returns a Assessment", tags = { "assessment" })
	@ApiResponses(value = { @ApiResponse(responseCode  = "200", description  = "Successfully retrieved"),
							@ApiResponse(responseCode = "406", description = "Not Acceptable"),
							@ApiResponse(responseCode = "500", description = "Internal Server Error")})
	@CrossOrigin(origins = "http://localhost:4200")
	@PostMapping(path = "/assessment")
	public @ResponseBody ResponseEntity<?> getAssessment( @Parameter(description = "Assessment in JSON format") @RequestBody Assessment assessment ) {
		log.debug("/assessment (Assessment "+assessment+")");
		
		Assessment assessmentOut = null;
		try {
			assessmentOut = assessmentRepository.getAssessment(assessment);
		} catch (ErrorFormatXMLException e) {
			ApiError apiError = new ApiError(HttpStatus.NOT_ACCEPTABLE, e.getLocalizedMessage());
			return new ResponseEntity<>(apiError, HttpStatus.NOT_ACCEPTABLE);
		} catch (Exception e) {
			ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, e.getLocalizedMessage());
			return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		
		return new ResponseEntity<>(assessmentOut, HttpStatus.OK);
		
	}	
	
	@Operation(summary  = "update a assessment", description  = "Returns a Assessment updated", tags = { "assessment" })
	@ApiResponses(value = { @ApiResponse(responseCode  = "200", description  = "Successfully retrieved"),
							@ApiResponse(responseCode = "406", description = "Not Acceptable"),
							@ApiResponse(responseCode = "500", description = "Internal Server Error")})
	@CrossOrigin(origins = "http://localhost:4200")
	@PostMapping(path = "/update-assessment")
	public @ResponseBody ResponseEntity<?> updateAssessment( @Parameter(description = "Assessment in JSON format") @RequestBody Assessment assessment ) {
		log.debug("/assessment (Assessment "+assessment+")");
		
		Assessment assessmentOut = null;
		try {
			assessmentOut = assessmentRepository.updateAssessment(assessment);
		} catch (ErrorFormatXMLException e) {
			ApiError apiError = new ApiError(HttpStatus.NOT_ACCEPTABLE, e.getLocalizedMessage());
			return new ResponseEntity<>(apiError, HttpStatus.NOT_ACCEPTABLE);
		} catch (Exception e) {
			ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, e.getLocalizedMessage());
			return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		
		return new ResponseEntity<>(assessmentOut, HttpStatus.OK);
		
	}	
	
	@Operation(summary = "Get a SBBs ans ABBs", description = "Returns a a SBBs ans ABBs", tags = { "sbbabb" })
	@ApiResponses(value = { @ApiResponse(responseCode  = "200", description  = "Successfully retrieved"),
							@ApiResponse(responseCode = "406", description = "Not Acceptable"),
							@ApiResponse(responseCode = "500", description = "Internal Server Error")})
	@PostMapping(path = "/sbb", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public @ResponseBody ResponseEntity<?> getSBB ( @Parameter(description = "XML file with SBB and ABB") @RequestParam("file") MultipartFile file ) {
		log.debug("/sbb (SBB "+file.getOriginalFilename()+")");
		
		List<Environment> SBBABBList = null;
		try {
			SBBABBList = assessmentRepository.getSBB(file);
		} catch (ErrorNullContentXMLException e) {
			ApiError apiError = new ApiError(HttpStatus.NOT_ACCEPTABLE, e.getLocalizedMessage());
			return new ResponseEntity<>(apiError, HttpStatus.NOT_ACCEPTABLE);
		} catch (ErrorFormatXMLException e) {
			ApiError apiError = new ApiError(HttpStatus.NOT_ACCEPTABLE, e.getLocalizedMessage());
			return new ResponseEntity<>(apiError, HttpStatus.NOT_ACCEPTABLE);
		} catch (Exception e) {
			ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, e.getLocalizedMessage());
			return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		
		return new ResponseEntity<>(SBBABBList, HttpStatus.OK);
		
	}	
	

			
}
