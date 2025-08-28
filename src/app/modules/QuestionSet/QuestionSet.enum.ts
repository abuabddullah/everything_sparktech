export enum IQSetTypes {
  // question type
  RadioQ = 'RadioQ',
  McqQ = 'McqQ',
  TrueFalseQ = 'TrueFalseQ',
  DropdownQ = 'DropdownQ',
  ShortAnswerQ = 'ShortAnswerQ',
  RearrangeQ = 'RearrangeQ',
  //question sets
  MULTIPLE_RADIO_Q = 'multiple_radio_q',
  MULTIPLE_PROMPTS_BUT_ONE_RADIO_Q = 'multiple_prompts_but_one_radio_q',
  MULTIPLE_MCQ_Q = 'multiple_mcq_q',
  MULTIPLE_PROMPTS_MULTIPLE_TRUE_FALSE_Q = 'multiple_prompts_multiple_true_false_q',
  MULTIPLE_PROMPTS_MULTIPLE_REARRANGE_Q = 'multiple_prompts_multiple_rearrange_q',
  MULTIPLE_PROMPTS_MULTIPLE_SHORT_ANSWER_Q = 'multiple_prompts_multiple_short_answer_q',
  MULTIPLE_PROMPTS_MULTIPLE_DROPDOWN_Q = 'multiple_prompts_multiple_dropdown_q',
  MULTIPLE_PROMPTS_MULTIPLE_MCQ_Q = 'multiple_prompts_multiple_mcq_q',
}

export enum IQSetRefType {
  STUDY_LESSON = 'StudyLesson',
  EXAMINATION = 'Examination',
}
