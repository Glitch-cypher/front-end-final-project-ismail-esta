import { coachNavBarArr } from '../../libs/globalVariables/navBarArrays';
import { Form, Select } from 'semantic-ui-react';
import { useState, useEffect } from 'react';
import serverSideProps from '../../libs/functions/serverSideProps';
import bootcamperNameReducer from '../../libs/functions/bootcamperNameReducer';
import AppHeader from '../../components/AppHeader';
import styles from './progress.module.css';
import ScoreGraph from '../../components/ScoreGraph';
import FeedbackTable from '../../components/bootcamper/FeedbackTable';

import {
  sortRecapData,
  sortMasteryData,
} from '../../libs/functions/sortFeedbackData';

// Page for coaches to check bootcampers feedback/ progress and compare
export default function Progress({ session }) {
  const [bootcamperName, setBootcamperName] = useState('Name here');
  const [bootcampersArr, setBootcampersArr] = useState([]);
  const [recapFeedbackData, setRecapFeedbackData] = useState([]);
  const [masteryFeedbackData, setMasteryFeedbackData] = useState([]);
  const [selectedData, setSelectedData] = useState(1);

  /* ↓↓↓ average score calculate ↓↓↓ */
  // let allData = session.data.data;
  // let filteredData = [];
  // for (let i = 1; i < 17; i++) {
  //   filteredData = allData
  //     .filter((obj) => {
  //       return obj.type === "recap" && obj.week === i;
  //     })
  //     .map((e) => {
  //       return e.passedtests;
  //     });
  // }
  // console.log(filteredData);

  // console.log(session.data.data);
  // const [averageArr, setAverageArr] = useState([]);
  // setAverageArr(
  //   session.data.data
  //     .map((e) => {
  //       return e.passedtests;
  //     })
  //     .filter((e) => {
  //       return e.type === "recap" && e.week === 4;
  //     })
  // );
  // console.log(averageArr);

  /* ↑↑↑ average score calculate ↑↑↑ */

  //sets bootcamper names for the dropdown menu and removes duplicates
  useEffect(() => {
    setBootcampersArr(
      session.data.data
        .map((bootcamper) => {
          return bootcamper.name;
        })
        .filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
        .reduce(bootcamperNameReducer, [])
    );
  }, [session]);

  //filters feedback when a name is selected
  useEffect(() => {
    setRecapFeedbackData(sortRecapData(bootcamperName, session));
    setMasteryFeedbackData(sortMasteryData(bootcamperName, session));
  }, [bootcamperName]);

  return (
    <div>
      <AppHeader session={session} navBarArr={coachNavBarArr} />
      <div className={styles.container}>
        <h2 className={styles.title}>Progress tracker</h2>
        <div className={styles.dropDown}>
          <Form>
            <Form.Group widths="equal">
              <Form.Field
                control={Select}
                options={bootcampersArr}
                placeholder="Choose bootcamper"
                search
                searchInput={{ id: 'form-select-control-name' }}
                onChange={(e, data) => {
                  setBootcamperName(data.value);
                }}
              />
            </Form.Group>
          </Form>
        </div>
        <div className={styles.graphs}>
          <div className={styles.graph}>
            <ScoreGraph
              feedbackData={masteryFeedbackData}
              bootcamperName={bootcamperName}
              taskType={'Mastery'}
              setSelectedData={setSelectedData}
            />
          </div>
          <div className={styles.graph}>
            <ScoreGraph
              feedbackData={recapFeedbackData}
              bootcamperName={bootcamperName}
              taskType={'Recap'}
              setSelectedData={setSelectedData}
            />
          </div>
        </div>
        <div>
          <FeedbackTable
            className={styles.table}
            selectedData={selectedData}
            bootcamperName={bootcamperName}
          />
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  async function progressFetchRequest(url, uid, token) {
    const res = await fetch(`${url}feedback`, {
      headers: { authorization: `Bearer ${token}` },
    });
    //this is fetching info from our DB through the hosted backend URL. The URL variable is stored in globalVariables where it is also using dotenv to keep the URL private.
    const data = await res.json();
    return data;
  }
  return serverSideProps(context, progressFetchRequest);
}
