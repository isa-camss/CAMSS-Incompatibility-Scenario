package com.nttdata.backend.others;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.apache.commons.io.FileUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nttdata.backend.beans.Assessment;
import com.nttdata.backend.beans.Compare;
import com.nttdata.backend.beans.Criteria;
import com.nttdata.backend.beans.Environment;
import com.nttdata.backend.beans.Result;
import com.nttdata.backend.beans.SBB;
import com.nttdata.backend.exceptions.ErrorFormatXMLException;

public class Utils {

	/**
	 * Variable to write log
	 */
	private static Logger log = LogManager.getLogger("Utils");

	/**
	 * Method for evaluating an assessment
	 * @param assessment Object Assessment with the information to be assessed
	 * @return Object Assessment with the assessment carried out
	 * @throws Exception
	 */
	public static Assessment getAssessment(Assessment assessment) throws Exception {
		
		boolean compatible = true;
		
		List<Integer> resultNumberList = new ArrayList<Integer>();
		Map<String, ArrayList<Integer>> resultsEditor = new HashMap<String, ArrayList<Integer>>();
		
		if ( assessment.isViews() && assessment.isDimensions() ) {
			throw new ErrorFormatXMLException("In an assessment there can be no views and dimensions.");
		}
		
		for (int h = 0; h < assessment.getCriteriaList().size(); h++) {
			Criteria criteria = assessment.getCriteriaList().get(h);
			String result = getResultQuestion(criteria.getAnswer(), criteria.getEffort(), criteria.getImpact());
			if (result.equals("ERROR")) {
				throw new ErrorFormatXMLException(
						"In an assessment impacts value only can be 'none' with effort value 'low' .");
			}
			if(!result.equals("")) {
				resultNumberList.add(getIntegerToString(result));
				criteria.setResult(result);
				if (resultsEditor.get(criteria.getTitle()) != null ) {
					resultsEditor.get(criteria.getTitle()).add(getIntegerToString(result));
					
				} else {
					ArrayList<Integer> list = new ArrayList<Integer>();
					list.add(getIntegerToString(result));
					resultsEditor.put(criteria.getTitle(), list);
				}
			}
		}
		
		for (Iterator<String> iterator = resultsEditor.keySet().iterator(); iterator.hasNext();) {
			String key = iterator.next();
			String resultString = getResultViewDimension(resultsEditor.get(key));
			Result result = new Result(key, resultString, getIntegerToString(resultString));
			assessment.getResultList().add(result);
			
			if( result.getResultValue() != 7 ) {
				compatible = false;
			}
			
		}
		
		if( compatible ) {
			assessment.setGlobalResult( Constants.NO_INCOMPATIBILITY );
		} else {
			assessment.setGlobalResult( Constants.INCOMPATIBILITY );
		}

		return assessment;
	}
	
	public static Assessment updateAssessment(Assessment assessment) throws Exception {
		
		boolean compatible = true;
		for (int h = 0; h < assessment.getResultList().size(); h++) {
			Result result = assessment.getResultList().get(h);
			if( result.getResultValue() != 7 ) {
				compatible = false;
			}
		}
		if( compatible ) {
			assessment.setGlobalResult( Constants.NO_INCOMPATIBILITY );
		} else {
			assessment.setGlobalResult( Constants.INCOMPATIBILITY );
		}
		
		return assessment;
	}

	/* Mirar si es mejor usar stax*/
	/**
	 * Method for obtaining ABBs and SBBs from an XML file
	 * @param file XML file with the ABBs and SBBs
	 * @return List of SBBABB objects with ABB or SBB information
	 * @throws Exception
	 */
	public static List<Environment> getSBB( MultipartFile file ) throws Exception {
		
		List<Environment> environmentList = new ArrayList<Environment>();
		String xml = new String(file.getBytes());

		log.debug("getSBB - file " + xml);

		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		try {
			DocumentBuilder builder = factory.newDocumentBuilder();
			StringBuilder xmlStringBuilder = new StringBuilder();
			xmlStringBuilder.append( xml );
			ByteArrayInputStream input =  new ByteArrayInputStream( xmlStringBuilder.toString().getBytes("UTF-8") );
			Document doc = builder.parse( input );

			XPath xPath = XPathFactory.newInstance().newXPath();
			
			ArrayList<String> propidDctType = new ArrayList<String>();
			ArrayList<String> propidEiraConcept = new ArrayList<String>();
			NodeList nodeListPropertyDefinition = (NodeList) xPath.compile(Constants.XPATH_PROPERTY_DEFINITION).evaluate(doc, XPathConstants.NODESET);
			
			for (int u = 0; u < nodeListPropertyDefinition.getLength(); u++) {
				Node nodeProDef = nodeListPropertyDefinition.item(u);
				Node nAtributeIdentifier = nodeProDef.getAttributes().getNamedItem(Constants.ATRIBUTE_IDENTIFIER);
				String identifier = nAtributeIdentifier.getFirstChild().getNodeValue();
				String name = "";
				NodeList listProDef = nodeProDef.getChildNodes();
				for (int g = 0; g < listProDef.getLength(); g++) {
					Node nodeChild = listProDef.item(g);
					if(nodeChild.getClass().getName().equals("com.sun.org.apache.xerces.internal.dom.DeferredElementImpl")) {
						if( nodeChild.getFirstChild() != null ) {
							name  = nodeChild.getFirstChild().getNodeValue();
							if(name.equals(Constants.ATRIBUTE_EIRA_CONCEPT)) {
								propidEiraConcept.add(identifier);
	 						}
							if(name.equals(Constants.ATRIBUTE_DCT_TYPE)) {
								propidDctType.add(identifier);
	 						}
						}
					}
				}
			}
			
			NodeList nodeListElement = (NodeList) xPath.compile(Constants.XPATH_ELEMENT).evaluate(doc, XPathConstants.NODESET);
			
			for (int h = 0; h < nodeListElement.getLength(); h++) {
				boolean isSBB = false;
				boolean isSpecification = false;
				Node nodeElement = nodeListElement.item(h);
				Node nAtributeIdentifier = nodeElement.getAttributes().getNamedItem(Constants.ATRIBUTE_IDENTIFIER);
				String identifier = nAtributeIdentifier.getFirstChild().getNodeValue();
				String name = "";
				NodeList listElements = nodeElement.getChildNodes();
				Environment environment = new Environment();
				for (int u = 0; u < listElements.getLength(); u++) {
					
					Node nodeChild = listElements.item(u);
					if(nodeChild.getClass().getName().equals("com.sun.org.apache.xerces.internal.dom.DeferredElementImpl")) {
 						
 						
						if(nodeChild.getNodeName().equals(Constants.ATRIBUTE_NAME)) {
							if( nodeChild.getFirstChild() != null ) {
								name = nodeChild.getFirstChild().getNodeValue();
							}
 						} else if(nodeChild.getNodeName().equals(Constants.NODE_PROPERTIES)) {
 							for (int g = 0; g < nodeChild.getChildNodes().getLength(); g++) {
 								Node nodeGrandchild = nodeChild.getChildNodes().item(g);
 								if( nodeGrandchild.getClass().getName().equals("com.sun.org.apache.xerces.internal.dom.DeferredElementImpl") ) {
 									Node nAtribute = nodeGrandchild.getAttributes().getNamedItem(Constants.ATRIBUTE_DEF_REF);
 									if( propidDctType.contains(nAtribute.getFirstChild().getNodeValue()) ) {
 										nodeGrandchild.getFirstChild().getNodeValue();
 										for ( int o = 0; o < nodeGrandchild.getChildNodes().getLength(); o++ ) {
 											Node nodeValue = nodeGrandchild.getChildNodes().item(o);
 											if( nodeValue.getClass().getName().equals("com.sun.org.apache.xerces.internal.dom.DeferredElementImpl") ) {
 												if( nodeValue.getFirstChild() != null && nodeValue.getFirstChild().getNodeValue() != null && nodeValue.getFirstChild().getNodeValue().equals("eira:InteroperabilitySpecificationContract") ) {
 													environment.setSpecificationsName(name);
 													environment.setSpecificationsId(identifier);
 													isSpecification = true;
 												}
 											}
										}
 									} else if( propidEiraConcept.contains(nAtribute.getFirstChild().getNodeValue()) ) {
 										nodeGrandchild.getFirstChild().getNodeValue();
 										for (int o = 0; o < nodeGrandchild.getChildNodes().getLength(); o++) {
 											Node nodeValue = nodeGrandchild.getChildNodes().item(o);
 											if(nodeValue.getClass().getName().equals("com.sun.org.apache.xerces.internal.dom.DeferredElementImpl")) {
 												if( nodeValue.getFirstChild() != null && nodeValue.getFirstChild().getNodeValue() != null && nodeValue.getFirstChild().getNodeValue().equals("eira:SolutionBuildingBlock")) {
 													environment.setSBBName(name);
 													environment.setSBBId(identifier);
 													isSBB = true;
 												}
 											}
										}
 									}
 								}
							}
 						} 
					}
				}
				if( isSpecification || isSBB ) {
					environmentList.add(environment);
				}
			}
			
			NodeList nodeListRelationships = (NodeList) xPath.compile(Constants.XPATH_RELATIONSHIPS).evaluate(doc, XPathConstants.NODESET);
			for (int g = 0; g < nodeListRelationships.getLength(); g++) {
				Node nodeRelationships = nodeListRelationships.item(g);	
				NodeList listRelationships = nodeRelationships.getChildNodes();
				for (int o = 0; o < listRelationships.getLength(); o++) {
					Node nodeChild = listRelationships.item(o);
					if(nodeChild.getClass().getName().equals("com.sun.org.apache.xerces.internal.dom.DeferredElementImpl")) {
						if(nodeChild.getNodeName().equals(Constants.ATRIBUTE_RELATIONSHIP)) {
							Node nAtributeSource = nodeChild.getAttributes().getNamedItem("source");
							String source = nAtributeSource.getFirstChild().getNodeValue();
							Node nAtributeTarget = nodeChild.getAttributes().getNamedItem("target");
							String target = nAtributeTarget.getFirstChild().getNodeValue();
							Environment envSource = null;
							Environment envTarget = null;
							List<Environment> environmentListCopy = new ArrayList<Environment>(environmentList);
							for (Iterator iterator = environmentListCopy.iterator(); iterator.hasNext();) {
								Environment environment2 = (Environment) iterator.next();
								if(environment2.getSBBId() != null) {
									if( environment2.getSBBId().equalsIgnoreCase(source) ) {
										envSource = environment2;
									}
									if(environment2.getSBBId().equalsIgnoreCase(target)  ) {
										envTarget = environment2;
									}
								}
								if(environment2.getSpecificationsId() != null) {
									if( environment2.getSpecificationsId().equalsIgnoreCase(source) ) {
										envSource = environment2;
									}
									if( environment2.getSpecificationsId().equalsIgnoreCase(target) ) {
										envTarget = environment2;
									}
								}
								
								if(envSource != null && envTarget != null ) {
									if(envSource.getSBBId() != null && envTarget.getSpecificationsId() != null ) {
										environmentList.remove(envSource);
										environmentList.remove(envTarget);
										envSource.mergeEnvironment(envTarget);
										environmentList.add(envSource);
									} else if(envTarget.getSBBId() != null && envSource.getSpecificationsId() != null ) {
										environmentList.remove(envSource);
										environmentList.remove(envTarget);
										envTarget.mergeEnvironment(envSource);
										environmentList.add(envTarget);
									}
									
									
								}
							}
							
						}
					}
				}
			}
		} catch (NullPointerException e) {
			log.error(e.getMessage());
		} catch (ParserConfigurationException e) {
			log.error(e.getMessage());
		} catch (SAXException e) {
			log.error(e.getMessage());
		} catch (IOException e) {
			log.error(e.getMessage());
		} catch (XPathExpressionException e) {
			log.error(e.getMessage());
		}

		return environmentList;
	}

	/**
	 * Method that obtains the result of a question
	 * @param answer String with answer information
	 * @param effort String with effort information
	 * @param impacts String with impacts information
	 * @return Result of the question
	 * @throws IOException Exception if there is an error when reading the JSON
	 */
	@SuppressWarnings("unchecked")
	private static String getResultQuestion(String answer, String effort, String impacts) throws IOException {
		
		String resultsCombination = FileUtils.readFileToString(new File(Constants.RESULTS_COMBINATION_JSON), "UTF-8");
		
		ObjectMapper objectMapper = new ObjectMapper();
		Map<String, Object> mapResults = objectMapper.readValue(resultsCombination, new TypeReference<Map<String,Object>>(){});
		
		String result = "";
		if(!answer.equalsIgnoreCase( Constants.NOT_APPLICABLE )) {
			if(answer.equalsIgnoreCase( Constants.YES )) {
				Map<String, Object> mapAnswer = (Map<String, Object>) mapResults.get(answer);
				Map<String, String> mapEffort = (Map<String, String>) mapAnswer.get(effort);
						
				result = mapEffort.get(impacts);
			} else {
				result = (String) mapResults.get(answer);
			}
		}
		return result;
	}
	
	/**
	 * Method that evaluates what is the result of the view or dimension.
	 * @param resultNumberList List of integers with the numerical representation of the results of the views or dimensions.
	 * @return Integer which is the numerical expression of the result of the view or dimension.
	 */
	private static String getResultViewDimension(List<Integer> resultNumberList) {
		
		Integer viewResultInt = Collections.min(resultNumberList);

		return getStringToInteger(viewResultInt);
	}
	
	/**
	 * Method that returns the numerical representation of a result.
	 * @param resultString String of the result
	 * @return numeric representation of a result
	 */
	private static Integer getIntegerToString( String resultString ) {
		Integer resultInt = null;
		
		switch (resultString) {
		case "Not Incompatible":
			resultInt = 7;
			break;
		case "Slightly Incompatible":
			resultInt = 6;
			break;
		case "Moderately Low Incompatible":
			resultInt = 5;
			break;
		case "Moderately Incompatible":
			resultInt = 4;
			break;
		case "Considerably Medium Incompatible":
			resultInt = 3;
			break;
		case "Considerably Incompatible":
			resultInt = 2;
			break;
		case "Incompatible":
			resultInt = 1;
			break;

		default:
			break;
		}
		
		return resultInt;
	}
	
	/**
	 * Method returning the string of a result set
	 * @param resultInt Integer with the result
	 * @return String of the result
	 */
	private static String getStringToInteger( int resultInt ) {
		String resultString = null;
		
		switch (resultInt) {
		case 7 :
			resultString = Constants.NO_INCOMPATIBILITY;
			break;
		case 6:
//			resultInt = 1;
			resultString = Constants.LOW_INCOMPATIBILITY;
			break;
		case 5:
			resultString = Constants.MEDIUM_LOW_INCOMPATIBILITY; 
			break;
		case 4:
//			resultInt = 3;
			resultString = Constants.MEDIUM_INCOMPATIBILITY;
			break;
		case 3:
			resultString = Constants.HIGH_MEDIUN_INCOMPATIBILITY;
			break;
		case 2:
			resultString = Constants.HIGH_INCOMPATIBILITY;
			break;
		case 1:
			resultString = Constants.INCOMPATIBILITY;
			break;

		default:
			break;
		}
		
		return resultString;
	}

}
