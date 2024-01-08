import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import color from 'picocolors';
import 'dotenv/config'
import axios from "axios";
import Table from 'cli-table';


const api = axios.create({
    baseURL: process.env.API_URL,
    timeout: 1000,
});

api.interceptors.request.use(config => {
    if (state.token !== undefined)
        config.headers.Authorization = `Bearer ${state.token}`;
    return config;
});

let confirmed_count = 0;

async function getAppointments(){
    try {
        const { status, data } = await api.get(`/appointments`);

        if (status === 200) {
            if (data.appointments.length > 0) {
                data.appointments.forEach(appointment => {
                    const startTime = new Date(appointment.start_time).toLocaleString();
                    const endTime = new Date(appointment.end_time).toLocaleString();
                    if (appointment.confirmed === false){
                        confirmed_count = confirmed_count + 1;
                    }
                    table.push([
                        appointment.patient_name,
                        startTime,
                        endTime,
                        appointment.confirmed ? 'Yes' : 'No',
                        appointment.cancelled ? 'Yes' : 'No'
                    ]);
                });
                console.log(table.toString())}
            }
        } catch (error){
            p.outro("Something went wrong when fetching your appointments")
        }
}

var table = new Table({
    chars: {
        'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
        , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
        , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
        , 'right': '║', 'right-mid': '╢', 'middle': '│'
    },
    head: [`Patient name`, `Starting time`, 'Ending time', `Confirmed`, `Cancelled`]
});

const state = {}

async function main() {
    console.clear();
    await setTimeout(1000);

    p.intro(`${color.bgCyan(color.black(' Entoothiast '))}`);

    const choice = await p.select({
        message: `What would you like to do?`,
        options: [
            { value: 'login', label: 'Login', hint: 'Do you already have an account?' },
            { value: 'register', label: 'Register' },
        ],
    });

    if (choice === 'login') {
        await loginUser();
    } else if (choice === 'register') {
        await registerUser();
    }
}

async function loginUser() {
    let loggedIn = false

    while (!loggedIn) {
        p.intro(`${color.bgGreen(color.black(' Login '))}`);

        const username = await p.text({
            message: 'Enter your username:',
            validate: (value) => {
                if (!value || value.trim().length == 0) return 'Please enter a valid username.';
            },
        });

        const password = await p.password({
            message: 'Enter your password:',
            validate: (value) => {
                if (!value) return 'Please enter a password.';
                if (value.length < 4) return 'Password should have at least 4 characters.';
            },
        });

        try {
            const { data, status } = await api.post("/users/login", { username, password })
            if (status === 200) {
                state.token = data.token;
                state.userId = data.user.id;
                state.userRole = data.user.role;
                p.outro('Logged in successfully!');
                loggedIn = true
             
                if (state.userRole === 'admin') {
                    await showAdminMenu();
                } else {
                    await showMenu();
                }
            } else {
                p.outro('Invalid username or password! Try again.');
            }
        } catch (error) {
            p.outro('Invalid username or password! Try again.');
        }

    }

}

async function registerUser() {
    let registered = false

    while (!registered) {
    p.intro(`${color.bgGreen(color.black(' Register '))}`);
    const name = await p.text({
        message: 'Enter your name:',
        validate: (value) => {
            if (!value || value.trim().length == 0) return 'Please enter a valid username.';
        },
    });
    const username = await p.text({
        message: 'Enter your new username:',
        validate: (value) => {
            if (!value || value.trim().length == 0) return 'Please enter a valid username.';
        },
    });
    const password = await p.password({
        message: 'Enter your new password:',
        validate: (value) => {
            if (!value) return 'Please enter a password.';
            if (value.length < 4) return 'Password should have at least 4 characters.';
        },
    });

        try {
            const role = 'dentist'
            const { status } = await api.post("/users/register", { username, password, name, role })
            if (status === 201) {
                p.outro('Registered successfully! You can login now');
                await loginUser()
            } else {
                p.outro('This user already exists or some fields are left empty.');
            }
        } catch (error) {
            p.outro('This user already exists or some fields are left empty');
        }
    }
}

async function addClinic() {

    p.intro(`${color.bgGreen(color.black(' Create a new clinic '))}`);
    const name = await p.text({
        message: 'Enter the name of the new clinic:',
        placeholder: "NewClinic",
        validate: (value) => {
            if (!value || value.trim().length == 0) return 'Please enter a valid username.';
        },
    });
    const regex = /^\d{2}\.\d{6}$/;
    const latitude = await p.text({
        message: 'Enter the latitude of this clinic:',
        placeholder: "23.345678",
        validate: (value) => {
            if (!value || value.trim().length == 0) return 'Please enter the coordinates of this clinic - only latitude.';
            if (!regex.test(value.trim())) {
                return 'Invalid latitude format';
            }
        },
    });
    const longitude = await p.text({
        message: 'Enter the longitude of this clinic:',
        placeholder: "23.456789",
        validate: (value) => {
            if (!value || value.trim().length == 0) return 'Please enter the coordinates of this clinic - only longitude.';
            if (!regex.test(value.trim())) {
                return 'Invalid longitude format';
            }
        },
    });

        try {
            const { status } = await api.post(`/clinics`, { name, latitude, longitude})
            if (status === 201) {
                p.outro('Successfully created a new clinic!');
                await showAdminMenu()
            } else {
                console.log("it goes to else")
                p.outro('This clinic already exists or some fields were left empty.');
            }
        } catch (error) {
            console.log('it goes to catch')
            console.log(error)
            p.outro('This clinic already exists or some fields were left empty.');
        }
    }


async function getAllClinicsToRemove() {
    try {
        const { data, status } =  await api.get(`/clinics`)
        if (status !== 200){
            console.log("Something went wrong when trying to fetch the clinics")
            return
        }
        const clinicTable = new Table({
            head: ["id", "Name", "Latitude", "Longitude"],
        });

        data.clinics.forEach(clinic => clinicTable.push([clinic.id, clinic.name, clinic.latitude, clinic.longitude]))
        console.log(clinicTable.toString())
        await removeClinic()
    } catch (error) {
        console.log(error)
        console.log("An error occurred when trying to fetch the clinics")
    }
}


async function getAllClinicsToEdit() {
    try {
        const { data, status } =  await api.get(`/clinics`)
        if (status !== 200){
            console.log("Something went wrong when trying to fetch the clinics")
            return
        }
        const clinicTable = new Table({
            head: ["id", "Name", "Latitude", "Longitude"],
        });

        data.clinics.forEach(clinic => clinicTable.push([clinic.id, clinic.name, clinic.latitude, clinic.longitude]))
        console.log(clinicTable.toString())
        await editClinic()
    } catch (error) {
        console.log(error)
        console.log("An error occurred when trying to fetch the clinics")
    }
}
async function showStats(){
    try {
        const {status, data} = await api.get(`/statistics/number-searches`)
            if (status !== 200){
                console.log("Some error occurred when fetching statistics")
                return
            } 
            p.outro(`${color.bgWhite(color.black(`${data.searches} searches for timeslots took place`))}`)
        
    } catch(error){
        console.log(error)
        console.log("Some error occurred when fetching statistics")
        return
    }

    try {
        const {status, data} = await api.get(`/statistics/timeslots-available`)
        if (status !== 200){
                console.log("Some error occurred when fetching statistics")
                return
            } 
            p.outro(`${color.bgWhite(color.black(`${data.timeslots} timeslots are currently available`))}`)
        
    } catch(error){
        console.log(error)
        console.log("Some error occurred when fetching statistics")
        return
    }

    }

async function editClinic() {
    const clinicTable = await viewClinics(false);
    let name;
    let latitude;
    let longitude;
    let id;
    const regex = /^\d{2}\.\d{6}$/;
    p.intro(`${color.bgGreen(color.black(' Edit an existing clinic '))}`);
    id = await p.text({
        message: 'Enter the id of a clinic you want to edit:',
        placeholder: "111",
        validate: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Please enter a valid ID.';
            }
            const parsedValue = parseFloat(value.trim());
            if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isInteger(parsedValue)) {
                return 'Please enter a valid positive integer ID.';
            }
        },
    });
    const options = [
        { value: 'name', label: 'Name' },
        { value: 'latitude', label: 'Latitude' },
        { value: 'longitude', label: 'Longitude' },
    ];
    
    const fields = await p.multiselect({
        message: 'Select what you want to update in a clinic (use spacebar to choose fields).',
        options: options,
        required: false,
    });
    

    if (fields) {
        const selectedValues = fields.map(field => {
            const selectedOption = options.find(option => option.value === field);
            return selectedOption ? selectedOption.value : null;
        });

    }
    if (fields.includes('name')){
        name = await p.text({
            message: 'Enter the new name for the clinics:',
            placeholder: "NewName",
            validate: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Please enter a valid name.';
                }
            },
            },
        );
    }

    if (fields.includes('latitude')){
        latitude = await p.text({
            message: 'Enter the new latitude for the clinics:',
            placeholder: "12.123456",
            validate: (value) => {
                if (!value || value.trim().length == 0) return 'Please enter the coordinates of this clinic - only latitude.';
                if (!regex.test(value.trim())) {
                    return 'Invalid latitude format';
                }
            },
        }
        );
    }

    if (fields.includes('longitude')){
        longitude = await p.text({
            message: 'Enter the new longitude for the clinics:',
            placeholder: "12.123456",
            vvalidate: (value) => {
                if (!value || value.trim().length == 0) return 'Please enter the coordinates of this clinic - only latitude.';
                if (!regex.test(value.trim())) {
                    return 'Invalid latitude format';
                }
            },
        }
        );
    }

      try {
          const {status} = await api.patch(`/clinics/${id}`, {name, longitude, latitude})
          if (status !== 200){
            console.log("Something went wrong when editing the clinic")
            await showAdminMenu()
          } 
          console.log("The clinic was successfully edited!")
     } catch(error){
        console.log("Some error occurred when editing the clinic")
     }
}



    

        





async function removeClinic(){
    var id;
    p.intro(`${color.bgGreen(color.black(' Delete an existing clinic '))}`);
    id = await p.text({
        message: 'Enter the id of a clinic you want to delete:',
        placeholder: "111",
        validate: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Please enter a valid ID.';
            }
            const parsedValue = parseFloat(value.trim());
            if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isInteger(parsedValue)) {
                return 'Please enter a valid positive integer ID.';
            }
        },
        },
    );
     const deleteClinic = await p.confirm({
        message: `Are you sure you want to delete clinic with this id ${id}?`,
      });
    if (deleteClinic === true){
        try {
            const { status } =  await api.delete(`/clinics/${id}`)
            if (status !== 200){
                console.log("Something went wrong when deleting the clinic")
                return
            }

            p.outro("The clinic was successfully deleted!")
            await showAdminMenu()
    } catch(error){
        console.log("An error occurred when deleting this clinic")
    }
    } else {
        await showAdminMenu()
    }
}

    
       
async function viewLogs() {
    try {
        const { data, status } = await api.get(`/logs?limit=100`)
        if (status !== 200) {
            console.log("Something went wrong when trying to fetch the logs")
            return
        }

        const logTable = new Table({
            head: ["Timestamp", "Topic", "Payload"],
            colWidths: [30, 50, 50]
        });

        data.logs.forEach(log => logTable.push([new Date(log.timestamp).toLocaleString(), log.topic, log.payload]))
        console.log(logTable.toString())
        await showMenu()

    } catch (err) {
        console.log(err)
        console.log("An error occured when trying to fetch the logs")
    }

}

async function viewClinics(printTable = true) {
    try {
        const { data, status } = await api.get(`/clinics`);
        if (status !== 200) {
            console.log("Something went wrong when trying to fetch the clinics");
            return null; // Return null or handle error appropriately
        }
        const clinicTable = new Table({
            head: ["id", "Name", "Latitude", "Longitude"],
        });

        data.clinics.forEach(clinic => clinicTable.push([clinic.id, clinic.name, clinic.latitude, clinic.longitude]));
        if (printTable) {
            p.intro(`${color.bgBlue(color.bgMagenta(' Clinics '))}`);
            console.log(clinicTable.toString());
        }

        return clinicTable; // Return the clinicTable
    } catch (error) {
        console.log(error);
        console.log("An error occurred when trying to fetch the clinics");
        return null; // Return null or handle error appropriately
    }
}

async function viewTimeslots(){
    try {
        const { status, data } = await api.get(`/dentists/${state.userId}/timeslots`);

        if (status === 200) {
            if (data && data.timeslots && data.timeslots.length > 0) {
                const timeslotTable = new Table({
                    head: ["Timeslot ID", "Start Time", "End Time"],
                    colWidths: [15, 30, 30],
                });

                data.timeslots.forEach((timeslot) => {
                    const startTime = new Date(timeslot.start_time).toLocaleString();
                    const endTime = new Date(timeslot.end_time).toLocaleString();

                    timeslotTable.push([timeslot.id, startTime, endTime]);
                });

                console.log(timeslotTable.toString());
            } else {
                console.log('No timeslots found for the dentist.');
            }
        } else {
            console.log('Failed to retrieve timeslots.');
        }
    } catch (error) {
        console.error('Error occurred while fetching timeslots:', error.message);
    }   
}


async function deleteTimeslot(){
    const id = await p.text({
        message: 'Enter the id of a timeslot that you want to delete',
        validate: (value) => {
            if (!value) return 'Please enter an id';
        },
    })
    try {
        const {status} = await api.delete(`/dentists/timeslots/${id}`)
        if (status !== 200){
            console.log("Some error occurred when trying to delete a timeslot")
            await showMenu()
        }
        console.log("Successfully deleted a timeslot!")
        await showMenu()
    } catch(error){
        console.log("Some error occurred when trying to delete a timeslot")
    }
}

async function assignDentist(){
    await viewClinics()
    try {
        let assignedCount = 0;
        const { data, status } = await api.get('/dentists')
        if (status !== 200){
            console.log("Something went wrong when trying to fetch the dentists")
            return
        }
        const dentistTable = new Table({
            head: ["Dentist id", "Name", "Clinic id"],
        });
        
        if (data.dentists.length > 0) {
            data.dentists.forEach(dentist => {
                if (dentist.clinic_id === null){
                    assignedCount = assignedCount + 1;
                    dentistTable.push([
                        dentist.id,
                        dentist.name,
                        '' // If clinic_id is null, push an empty string
                    ]);
                } else {
                    dentistTable.push([
                        dentist.id,
                        dentist.name,
                        dentist.clinic_id
                    ]);
                }
            });
        p.intro(`${color.bgBlue(color.bgMagenta(' Dentists '))}`);
        console.log(dentistTable.toString())
        if (assignedCount > 0){
            console.log(`${assignedCount} dentists are not assigned to any clinic.`)
            const assign = await p.confirm({
                message: 'Would you like to assign a dentist to a clinic?',
              });
            if (assign === false){
                await showAdminMenu()
            } else if (assign === true){
                const dentist = await p.text({
                    message: 'Enter the id of a dentist whom you want to assign to a clinic:',
                    placeholder: "111",
                    validate: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Please enter a valid ID.';
                        }
                        const parsedValue = parseFloat(value.trim());
                        if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isInteger(parsedValue)) {
                            return 'Please enter a valid positive integer ID.';
                        }
                    },
                    },
                );
                const clinic = await p.text({
                    message: 'Enter the id of a clinic to which you want to assign this dentist:',
                    placeholder: "111",
                    validate: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Please enter a valid ID.';
                        }
                        const parsedValue = parseFloat(value.trim());
                        if (isNaN(parsedValue) || parsedValue <= 0 || !Number.isInteger(parsedValue)) {
                            return 'Please enter a valid positive integer ID.';
                        }
                    },
                    },
                );
                console.log(dentist)
                console.log(clinic)
                try{
                    const { status } = await api.patch(`/dentists/${dentist}`, {clinic})
                    if (status !== 200){
                        console.log("Some error occurred when assigning dentist to a clinic")
                        await showAdminMenu()
                        return
                    }
                    console.log("Dentist successfully assigned to a clinic!")
                    await showAdminMenu()
                } catch (error){
                    console.log("Some error occurred when trying to assign a dentist to a clinic", error)
                }
            }
        }
        
    } 
} catch (error){
    console.log("Some error occurred when trying to fetch dentists")
}
}
async function showAdminMenu() {
    const adminMenuChoice = await p.select({
        message: 'Choose an option:',
        options: [
            { value: 'addClinic', label: 'Add a new clinic' },
            { value: 'viewClinics', label: 'View all clinics' },
            { value: 'removeClinic', label: 'Remove clinic' },
            { value: 'viewLogs', label: "View logs"},
            { value: 'editClinic', label: "Edit a clinic"}, 
            { value: 'assignDentist', label: 'Assign a dentist to a clinic'},
            { value: 'stats', label: 'See statistics'},
            { value: 'logout', label: 'Log out' },
            { value: 'exit', label: 'Exit' },
        ],
    });

    switch (adminMenuChoice) {
        case 'addClinic':
            p.intro(`${color.bgBlue(color.black(' Create a new clinic '))}`);
            await addClinic()
            break;
        case 'viewClinics':
            p.intro(`${color.bgBlue(color.black(' View all clinics '))}`);
            await viewClinics()
            break;
        case 'removeClinic':
            p.intro(`${color.bgBlue(color.black(' Delete an existing clinic '))}`);
            await getAllClinicsToRemove();
            break;
        case 'stats':
            p.intro(`${color.bgBlue(color.black(' Statistics '))}`);
            await showStats();
            break;
        case 'editClinic':
            p.intro(`${color.bgBlue(color.black(' Edit an existing clinic '))}`);
            await getAllClinicsToEdit()
            break;
        case 'assignDentist':
            p.intro(`${color.bgBlue(color.black(' Assign a dentist to a clinic '))}`);
            await assignDentist();
            break;
        case 'logout':
            p.outro('See you soon!');
            main().catch(console.error);
            break;
        case 'viewLogs':
            case 'logs':
            p.intro(`${color.bgBlue(color.black(' View logs '))}`);
            await viewLogs()
            break;
        case 'exit':
            console.clear();
            p.outro('Thank you for using Entoothiast!');
            setTimeout(1000);
            process.exit(0);
            break;
        default:
            break;
    }
}


async function showMenu() {
    if (state.userRole === 'admin') {
        await showAdminMenu();
    } else {
    const menuChoice = await p.select({
        message: 'Choose an option:',
        options: [
            { value: 'update', label: 'Update account details' },
            { value: 'view', label: 'View upcoming appointments' },
            { value: 'publish', label: 'Publish a new timeslot' },
            { value: 'viewTimeslots', label: 'View your timeslots' },
            { value: 'cancel', label: 'Cancel an appointment' },
            { value: 'delete', label: 'Delete a published timeslot' },
            { value: 'logout', label: 'Log out' },
            { value: 'exit', label: 'Exit' },
        ],
    });

    switch (menuChoice) {
        case 'update':
            p.intro(`${color.bgYellow(color.black(' Update Account Details '))}`);
            
            const fieldToUpdate = await p.select({
                message: 'Which field do you want to update?',
                options: [
                    { value: 'username', label: 'Username' },
                    { value: 'name', label: 'Name' },
                ],
            });
        
            const newValue = await p.text({
                message: `Enter the new value for ${fieldToUpdate}:`,
                validate: (value) => {
                    if (!value || value.trim().length === 0) return `Please enter a valid ${fieldToUpdate}.`;
                },
            });

            const newData = {
                [fieldToUpdate]: newValue,
            };

            try {
                const { status, data } = await api.patch(`/users/${state.userId}`, newData);

                if (status === 200) {
                    p.outro('Account details updated successfully!');
                } else {
                    p.outro('Failed to update account details.');
                }
            } catch (error) {
                console.error('Failed to update account details:', error.message);
            }
            await showMenu();
            break;
        case 'view':
            p.intro(`${color.bgBlue(color.black(' View upcoming appointments '))}`);
            try {
                const { status, data } = await api.get(`/appointments`);

                if (status === 200) {
                    if (data.appointments.length > 0) {
                        data.appointments.forEach(appointment => {
                            const startTime = new Date(appointment.start_time).toLocaleString();
                            const endTime = new Date(appointment.end_time).toLocaleString();
                            if (appointment.confirmed === false){
                                confirmed_count = confirmed_count + 1;
                            }
                            table.push([
                                appointment.patient_name,
                                startTime,
                                endTime,
                                appointment.confirmed ? 'Yes' : 'No',
                                appointment.cancelled ? 'Yes' : 'No'
                            ]);
                        });
                        console.log(table.toString())
                        table.length = 0
                        if (confirmed_count === 0){
                            console.log("All your appointments are confirmed")
                        } else { 
                            console.log(`You still haven't confirmed ${confirmed_count} appointments. `)
                            const edit = await p.confirm({
                                message: 'Would you like to confirm your upcoming appointments?',
                              });
                            if (edit === false){
                                await showMenu()
                                break
                            }
                            else if (edit === true){
                                const id = await p.text({
                                    message: 'Enter the id of an appointment that you want to confirm',
                                    validate: (value) => {
                                        if (!value) return 'Please enter an id';
                                    },
                                });
    
                                try{
                                    const confirmed = true
                                    const { status, data } = await api.patch(`/appointments/${id}`, {confirmed});
                                    if (status === 200){
                                        p.outro(`Appointment ${id} confirmed`);
                                    } 
                                } catch (error){
                                    p.outro("An error occurred when confirming an appointment")
                                }
                            }
                        }
                    } else {
                        p.outro('No upcoming appointments found.');
                    }
                } else {
                    p.outro('Failed to retrieve appointments.');
                }
            } catch (error) {
                console.log(error);
                p.outro('Error occurred while fetching appointments.');
            }
            await showMenu();
            break;
        case 'publish':
            p.intro(`${color.bgBlue(color.black(' Publish a new available timeslot '))}`);
            const date = await p.text({
                placeholder: '2023-11-21',
                message: 'Enter the date (YYYY-MM-DD):',
                validate: (value) => {
                    if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return 'Please enter a valid date in the format YYYY-MM-DD.';
                },
            });
            const start = await p.text({
                placeholder: '14:00:00',
                message: 'Enter the starting time (HH:MM:SS) of a new timeslot:',
                validate: (value) => {
                    if (!value.match(/^\d{2}:\d{2}:\d{2}$/i)) return 'Please enter a valid time in the format HH:MM:SS.';
                },
            });
            const end = await p.text({
                placeholder: '15:00:00',
                message: 'Enter the ending time (HH:MM:SS) of a new timeslot:',
                validate: (value) => {
                    if (!value.match(/^\d{2}:\d{2}:\d{2}$/i)) return 'Please enter a valid time in the format HH:MM:SS.';
                },
            });
            try {
                //get the times in the needed format "2023-12-05 13:00:00"
                const start_time = date + " " + start
                const end_time = date + " " + end
                const { status } = await api.post(`/dentists/timeslots`, { start_time, end_time })
                if (status === 201) {
                    p.outro(`Timeslot published for ${date} starting at ${start} until ${end}`);
                } else {
                    p.outro('All fields have to be filled.');
                }
            } catch (error) {
                console.log(error)
                p.outro('All fields have to be filled');
            }
            await showMenu();
            break;

            case 'viewTimeslots':
                p.intro(`${color.bgBlue(color.black(' View Timeslots '))}`);
                await viewTimeslots()
                await showMenu();
                break;    
                     
        
        case 'cancel':
            p.intro(`${color.bgBlue(color.black(' Cancel an appointment '))}`);
            // Handle cancel an appointment
                try {
                    const { status, data } = await api.get(`/appointments`);
            
                    if (status === 200) {
                        if (data.appointments.length > 0) {
                            const appointmentTable = new Table({
                                head: ["Appointment id", "Patient name", "Starting time", "Ending time", "Confirmed", "Cancelled"],
                            });
            
                            data.appointments.forEach(appointment => {
                                const startTime = new Date(appointment.start_time).toLocaleString();
                                const endTime = new Date(appointment.end_time).toLocaleString();
                                if (appointment.confirmed === false){
                                    confirmed_count = confirmed_count + 1;
                                }
                                appointmentTable.push([
                                    appointment.appointment_id,
                                    appointment.patient_name,
                                    startTime,
                                    endTime,
                                    appointment.confirmed ? 'Yes' : 'No',
                                    appointment.cancelled ? 'Yes' : 'No'
                                ]);
                            });
            
                        console.log(appointmentTable.toString())
                        appointmentTable.length = 0
                            const cancel = await p.confirm({
                                message: 'Would you like to cancel any of your upcoming appointments?',
                              });
                            if (cancel === false){
                                await showMenu()
                                break
                            }
                            else if (cancel === true){
                                const id = await p.text({
                                    message: 'Enter the id of an appointment that you want to cancel',
                                    validate: (value) => {
                                        if (!value) return 'Please enter an id';
                                    },
                                });
    
                                try{
                                    const cancelled = true
                                    const { status, data } = await api.patch(`/appointments/${id}`, {cancelled});
                                    if (status === 200){
                                        p.outro(`Appointment ${id} cancelled`);
                                        await showMenu()
                                    } 
                                } catch (error){
                                    p.outro("An error occurred when cancelling an appointment")
                                }
                            }
                    } else {
                        p.outro('No upcoming appointments found.');
                    }
                } else {
                    p.outro('Failed to retrieve appointments.');
                }
            } catch (error) {
                console.log(error);
                p.outro('Error occurred while fetching appointments.');
            }
            break;
        case 'delete':
            p.intro(`${color.bgBlue(color.black(' Delete an appointment '))}`);
            await viewTimeslots()
            const deletion = await p.confirm({
                message: 'Would you like to delete any of your published timeslots?',
              });
            if (deletion === false){
                await showMenu()
                break
            }
            else if (deletion === true){
                await deleteTimeslot()
            }
            break;
        case 'logout':
            p.outro('See you soon!');
            main().catch(console.error);
            break;
        case 'exit':
            console.clear();
            p.outro('Thank you for using Entoothiast!');
            setTimeout(1000);
            process.exit(0);
            break;
        default:
            break;
    }
}
}

main().catch(console.error);






