package com.nttdata.backend.beans;

public class Criteria {
	
	private String title;
	private Integer questionId;
	private String answer;
	private String effort;
	private String additionalEffort;
	private String impact;
	private String additionalImpact;
	private String additionalComments;
	private String result;
	
	public Criteria() {
		super();
	}

	public Criteria(String title, Integer questionId, String answer, String effort, String additionalEffort,
			String impact, String additionalImpact, String additionalComments, String result) {
		super();
		this.title = title;
		this.questionId = questionId;
		this.answer = answer;
		this.effort = effort;
		this.additionalEffort = additionalEffort;
		this.impact = impact;
		this.additionalImpact = additionalImpact;
		this.additionalComments = additionalComments;
		this.result = result;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Integer getQuestionId() {
		return questionId;
	}

	public void setQuestionId(Integer questionId) {
		this.questionId = questionId;
	}

	public String getAnswer() {
		return answer;
	}

	public void setAnswer(String answer) {
		this.answer = answer;
	}

	public String getEffort() {
		return effort;
	}

	public void setEffort(String effort) {
		this.effort = effort;
	}

	public String getAdditionalEffort() {
		return additionalEffort;
	}

	public void setAdditionalEffort(String additionalEffort) {
		this.additionalEffort = additionalEffort;
	}

	public String getImpact() {
		return impact;
	}

	public void setImpact(String impact) {
		this.impact = impact;
	}

	public String getAdditionalImpact() {
		return additionalImpact;
	}

	public void setAdditionalImpact(String additionalImpact) {
		this.additionalImpact = additionalImpact;
	}

	public String getAdditionalComments() {
		return additionalComments;
	}

	public void setAdditionalComments(String additionalComments) {
		this.additionalComments = additionalComments;
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	@Override
	public String toString() {
		return "Criteria [title=" + title + ", questionId=" + questionId + ", answer=" + answer + ", effort=" + effort
				+ ", additionalEffort=" + additionalEffort + ", impact=" + impact + ", additionalImpact="
				+ additionalImpact + ", additionalComments=" + additionalComments + ", result=" + result + "]";
	}


}
