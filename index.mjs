import inquirer from 'inquirer';
import cliProgress from 'cli-progress';
import alert from 'js-cli-alerts';

//for the progress bar
//const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const options = [
  'View upcoming appointments',
  'Publish new time slot',
  'Cancel an appointment',
  'Exit',
];
// alert({type: `success`, msg: `Everything finished!`});
// alert({type: `success`, msg: `Everything finished!`, name: `DONE`});
// alert({type: `warning`, msg: `You didn't add something!`});
// alert({type: `info`, msg: `Awais is awesome!`});
// alert({type: `error`, msg: `Something went wrong!`});
console.log("Welcome to Entoothiast!")
inquirer
  .prompt([
    {
      type: 'list',
      name: 'selectedOption',
      message: 'Select an option:',
      choices: options,
    },
  ])
  .then((answers) => {
    switch (answers.selectedOption){
      case "View upcoming appointments":
        console.log("Next appointment tomorrow!");
        break;
      case "Publish new time slot":
        alert({type: 'success', msg: "New time slot published!"});
        break;
      case "Cancel an appointment":
        alert({type: 'success', msg: "Appointment cancelled"});
        break;
      case "Exit":
        console.log("See you soon!")
        break;
    }
  });






