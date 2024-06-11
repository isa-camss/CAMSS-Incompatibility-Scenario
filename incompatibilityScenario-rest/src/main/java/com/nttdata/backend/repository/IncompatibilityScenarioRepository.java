package com.nttdata.backend.repository;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import com.nttdata.backend.beans.Assessment;
import com.nttdata.backend.beans.Compare;
import com.nttdata.backend.beans.Environment;
import com.nttdata.backend.beans.SBB;
import com.nttdata.backend.exceptions.ErrorNullContentXMLException;
import com.nttdata.backend.others.Utils;

/**
 * Assessment service
 */
@Repository
public class IncompatibilityScenarioRepository {
	
	/**
	 * Variable to write log
	 */
	private Logger log = LogManager.getLogger(getClass());
	
	/**
	 * Method for evaluating an assessment
	 * @param assessment Object Assessment with the information to be assessed
	 * @return Object Assessment with the assessment carried out
	 * @throws Exception
	 */
	public Assessment getAssessment(Assessment assessment) throws Exception {
		log.debug("getAssessment - "+ assessment);
		
		return Utils.getAssessment(assessment);
	}
	
	public Assessment updateAssessment(Assessment assessment) throws Exception {
		log.debug("updateAssessment - "+ assessment);
		
		return Utils.updateAssessment(assessment);
	}
	


	
	/**
	 * Method for obtaining ABBs and SBBs from an XML file
	 * @param file XML file with the ABBs and SBBs
	 * @return List of SBBABB objects with ABB or SBB information
	 * @throws Exception
	 */
	public List<Environment> getSBB( MultipartFile file ) throws Exception {
		
		if( file == null ) {
			throw new ErrorNullContentXMLException("The xml file is null ");
		}
		log.debug("getSBB - "+ new String(file.getBytes()));
		
		return Utils.getSBB(file);
	}
}

