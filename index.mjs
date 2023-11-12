import inquirer from 'inquirer';
import cliProgress from 'cli-progress';
import alert from 'js-cli-alerts';
import Table from 'cli-table';
import enquirer from 'enquirer';
const {prompt, Form} = enquirer;


//for the progress bar
//const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const grayPrompt = '\x1b[90m\x1b[1mPress q to go back\x1b[0m';

function printGrayPrompt() {
  console.log(grayPrompt);
}
let table = new Table({
  head: ['Date', 'Time', 'Patient', 'Notes'],
  chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
});

table.push(
  ['11/12/2023', '15.20', 'Mary Joe', 'Regular check-up']
, ['14/10/2023', '17.00', 'Karen Smith', 'Wisdom tooth removal',]
);


const options = [
  'View upcoming appointments',
  'View calendar',
  'Publish new time slot',
  'Cancel an appointment',
  'Exit',
];
// alert({type: `success`, msg: `Everything finished!`});
// alert({type: `success`, msg: `Everything finished!`, name: `DONE`});
// alert({type: `warning`, msg: `You didn't add something!`});
// alert({type: `info`, msg: `Awais is awesome!`});
// alert({type: `error`, msg: `Something went wrong!`});
console.log("Welcome to Entoothiast!");
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
        console.log(table.toString());
        printGrayPrompt();
        break;
      case "Publish new time slot":
        //alert({type: 'success', msg: "New time slot published!"});
        const prompt = new Form({
          name: 'user',
          message: 'Please provide the following information to publish a new time slot:',
          choices: [
            { name: 'date', message: 'Date', initial: '30/09/2023' },
            { name: 'time', message: 'Time', initial: '15:30' }
          ]
        });
        
        prompt.run()
          .then(value => console.log('Answer:', value))
          .catch(console.error);
        
        printGrayPrompt();
        break;
      case "Cancel an appointment":
        alert({type: 'success', msg: "Appointment cancelled"});
        printGrayPrompt();
        break;
      case "Exit":
        console.log("See you soon!")
        break;
    }
  });

  







