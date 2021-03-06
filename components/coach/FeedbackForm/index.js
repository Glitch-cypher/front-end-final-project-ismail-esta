//semantic ui used for form skeleton
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, TextArea, Button, Select } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import styles from './feedbackForm.module.css';
import useFormSubmit from '../../../libs/customHooks/useFormSubmit';
import validateFeedbackForm from '../../../libs/functions/feedbackForm/validateFeedbackForm';
import { backendUrl } from '../../../libs/globalVariables/urls';
import {
  bootcampWeeks,
  tasksArray,
} from '../../../libs/globalVariables/coachFeedbackFormArr';
import bootCampersArrayReducer from '../../../libs/functions/bootCampersArrayReducer.js';
import Image from 'next/image';

// initial values object -> all the values have the initial state of ""
// the state will be changed when the form will be updated
const valuesInitialState = {
  bootcamperName: '',
  week: '',
  taskType: '',
  subject: '',
  dueDate: '',
  dateSubmitted: '',
  passedTests: '',
  totalTests: '',
  comments: '',
};

// what fields we want cleared after submit
const resetState = {
  bootcamperName: '',
  passedTests: '',
  totalTests: '',
  comments: '',
  dateSubmitted: '',
};

export default function FeedbackForm({ session }) {
  // initial states for bootcamper uid
  // initial state for the errors occurs from server when will attempt to submit data to database
  const [bootcamperUid, setBootcamperUid] = useState('');
  const [serverErr, setServerErr] = useState(null);

  const { token } = session;

  // router used on the redirect button
  const router = useRouter();

  // destructuring data coming from the useFormSubmit custom hook
  // the hook takes in the valuesInitialState object, validateFeedback form function which checks if there are any errors in the form and the feedbackPost function to submit data to database
  const {
    handleChange,
    handleSubmit,
    dropDownHandleChange,
    setPostSuccessful,
    isSubmitting,
    values,
    errors,
    postSuccessful,
  } = useFormSubmit(
    valuesInitialState,
    resetState,
    validateFeedbackForm,
    feedbackPost
  );

  //current date and time -> send it to database when the form is submitted
  let dateTime = new Date().toISOString().split('T')[0];

  // the coach name is comming from the page session
  let coachName = session.name;

  // the array with all the bootcamers is comming from session
  let bootcampersInfoArr = session.data;

  // using the imported bootCampersArrayReducer to set the bootcampers in a format to be used in the dropdown menu
  let bootcampersArr = bootCampersArrayReducer(bootcampersInfoArr);

  // getting the bootcamer uid after the coach selects a bootcamper
  useEffect(() => {
    if (values.bootcamperName !== '') {
      setBootcamperUid(
        bootcampersInfoArr.filter(function (item) {
          return item.name === `${values.bootcamperName}`;
        })[0].uid
      );
    }
  }, [values.bootcamperName]);

  // console.log(bootcamperUid);
  // function to post the data to database
  async function feedbackPost() {
    const {
      week,
      taskType,
      subject,
      dueDate,
      dateSubmitted,
      passedTests,
      totalTests,
      comments,
    } = values;
    // console.log(values);
    // console.log(bootcamperUid);
    try {
      await fetch(`${backendUrl}feedback`, {
        method: 'POST',
        body: JSON.stringify({
          bootcamperuid: `${bootcamperUid}`,
          coachname: `${coachName}`,
          feedbackdate: `${dateTime}`,
          subject: `${subject}`,
          week: week,
          type: `${taskType}`,
          passedtests: passedTests,
          totaltests: totalTests,
          qualitative: `${comments}`,
          duedate: `${dueDate}`,
          datesubmitted: `${dateSubmitted}`,
        }),
        headers: {
          'content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          authorization: `Bearer ${token}`,
        },
        mode: 'cors',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setPostSuccessful(true);
        });

      // console.log('handlesubmit working');
    } catch (err) {
      console.error('Server error', err);
      setServerErr(`Server error: ${err.message}. Please try again!`);
    }
  }
  if (postSuccessful) {
    return (
      <div className={styles.submitMessage}>
        <svg
          className={styles.svg}
          version='1.1'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 130.2 130.2'>
          <circle
            className={`${styles.path} ${styles.circle}`}
            fill='none'
            stroke='#2d8b61'
            strokeWidth='6'
            strokeMiterlimit='10'
            cx='65.1'
            cy='65.1'
            r='62.1'
          />
          <polyline
            className={`${styles.path} ${styles.check}`}
            fill='none'
            stroke='#2d8b61'
            strokeWidth='6'
            strokeLinecap='round'
            strokeMiterlimit='10'
            points='100.2,40.2 51.5,88.8 29.8,67.5 '
          />
        </svg>
        <p className={styles.postSuccess}>Feedback submitted successfully</p>
      </div>
    );
  } else
    return (
      <Form className={styles.form}>
        <Form.Field
          className={errors.bootcamperName && `${styles.errorInput}`}
          control={Select}
          options={bootcampersArr}
          label={{
            children: 'Bootcamper Name',
          }}
          placeholder='Bootcamper Name'
          search
          name='bootcamperName'
          value={values.bootcamperName}
          onChange={dropDownHandleChange}
        />
        <Form.Field
          className={errors.week && `${styles.errorInput}`}
          control={Select}
          options={bootcampWeeks}
          label={{
            children: 'Week',
          }}
          placeholder='Week'
          search
          name='week'
          value={values.week}
          onChange={dropDownHandleChange}
        />
        <Form.Field
          className={errors.taskType && `${styles.errorInput}`}
          control={Select}
          options={tasksArray}
          label={{
            children: 'Task type',
          }}
          placeholder='Task type'
          search
          name='taskType'
          value={values.taskType}
          onChange={dropDownHandleChange}
        />
        <Form.Field className={errors.subject && `${styles.errorInput}`}>
          <label>Subject</label>
          <Input
            placeholder='e.g. React/ JS'
            name='subject'
            value={values.subject}
            onChange={handleChange}
          />
        </Form.Field>
        <Form.Field className={errors.dueDate && `${styles.errorInput}`}>
          <label>Due Date</label>
          <Input
            type='date'
            name='dueDate'
            value={values.dueDate}
            onChange={handleChange}
          />
        </Form.Field>
        <Form.Field className={errors.dueDate && `${styles.errorInput}`}>
          <label>Date Submitted</label>
          <Input
            type='date'
            name='dateSubmitted'
            value={values.dateSubmitted}
            onChange={handleChange}
          />
        </Form.Field>
        <Form.Field className={errors.passedTests && `${styles.errorInput}`}>
          <label>Passed Tests</label>
          <Input
            type='number'
            min='0'
            placeholder='Input the tests passed'
            name='passedTests'
            value={values.passedTests}
            onChange={handleChange}
          />
        </Form.Field>
        <Form.Field className={errors.totalTests && `${styles.errorInput}`}>
          <label>Total Tests</label>
          <Input
            type='number'
            min={values.passedTests}
            placeholder='Input total tests'
            name='totalTests'
            value={values.totalTests}
            onChange={handleChange}
          />
        </Form.Field>
        <Form.Field
          className={errors.comments && `${styles.errorInput}`}
          control={TextArea}
          label='Feedback'
          placeholder='Feedback'
          name='comments'
          value={values.comments}
          onChange={handleChange}
        />
        {/* if errors, they will be displayed here */}
        {errors && (
          <div>
            {errors.bootcamperName && (
              <p className={styles.errorText}>{errors.bootcamperName}</p>
            )}
            {errors.week && <p className={styles.errorText}>{errors.week}</p>}
            {errors.taskType && (
              <p className={styles.errorText}>{errors.taskType}</p>
            )}
            {errors.subject && (
              <p className={styles.errorText}>{errors.subject}</p>
            )}
            {errors.passedTests && (
              <p className={styles.errorText}>{errors.passedTests}</p>
            )}
            {errors.totalTests && (
              <p className={styles.errorText}>{errors.totalTests}</p>
            )}
            {errors.dueDate && (
              <p className={styles.errorText}>{errors.dueDate}</p>
            )}
            {errors.dateSubmitted && (
              <p className={styles.errorText}>{errors.dateSubmitted}</p>
            )}
            {errors.comments && (
              <p className={styles.errorText}>{errors.comments}</p>
            )}
            {serverErr && <p className={styles.errorText}>{serverErr}</p>}
          </div>
        )}
        <div className={styles.buttonContainer}>
          <Button
            className={styles.submitButton}
            disabled={isSubmitting}
            onClick={handleSubmit}
            type='submit'
            content='Submit Feedback'
          />

          {/*
        <img
          className={styles.successIcon}
          src='/submit_success.gif'
          alt='Successfuly submitted'
        /> */}
        </div>
      </Form>
    );
}
