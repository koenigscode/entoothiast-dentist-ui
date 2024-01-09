import * as p from '@clack/prompts';
import color from 'picocolors';
import main from './index.js';
import Table from 'cli-table';


class DentistMenu {
    constructor(api, state) {
        this.api = api;
        this.state = state || {};
    }

    async showMenu() {
        const menuChoice = await p.select({
            message: 'Choose an option:',
            options: [
                { value: 'update', label: 'Update account details' },
                { value: 'view', label: 'View upcoming appointments' },
                { value: 'publish', label: 'Publish a new timeslot' },
                { value: 'viewTimeslots', label: 'View your timeslots' },
                { value: 'cancel', label: 'Cancel an appointment' },
                { value: 'delete', label: 'Delete a published timeslot' },
                { value: 'notifs', label:`View unread notifications`},
                { value: 'logout', label: 'Log out' },
                { value: 'exit', label: 'Exit' },
            ],
        });
        switch (menuChoice) {
            case 'update':
                p.intro(`${color.bgYellow(color.black(' Update Account Details '))}`);
                await this.updateUser()
                await this.showMenu();
                break;
            case 'view':
                p.intro(`${color.bgYellow(color.black(' View upcoming appointments '))}`);
                await this.viewAppointments()
                await this.showMenu();
                break;
            case 'publish':
                p.intro(`${color.bgBlue(color.black(' Publish a new available timeslot '))}`);
                await this.publishTimeslot()
                await this.showMenu();
                break;
            case 'viewTimeslots':
                p.intro(`${color.bgBlue(color.black(' View Timeslots '))}`);
                await this.viewTimeslots()
                await this.showMenu();
                break;    
                         
            case 'cancel':
                p.intro(`${color.bgBlue(color.black(' Cancel an appointment '))}`);
                await this.cancelAppointment()
                await this.showMenu()
                break;
            case 'delete':
                p.intro(`${color.bgBlue(color.black(' Delete an appointment '))}`);
                await this.viewTimeslots()
                const deletion = await p.confirm({
                    message: 'Would you like to delete any of your published timeslots?',
                  });
                if (deletion === false){
                    await this.showMenu()
                    break
                }
                else if (deletion === true){
                    await this.deleteTimeslot()
                }
                await this.showMenu()
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

    async updateUser(){
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
            const { status, data } = await this.api.patch(`/users/${this.state.userId}`, newData);

            if (status === 200) {
                p.outro('Account details updated successfully!');
            } else {
                p.outro('Failed to update account details.');
            }
        } catch (error) {
            console.error('Failed to update account details:', error.message);
        }
    }
async viewAppointments(){
                try {
                    const { status, data } = await this.api.get(`/appointments`);
    
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
                                        const { status, data } = await this.api.patch(`/appointments/${id}`, {confirmed});
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
}

async publishTimeslot(){
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
        const start_time = date + " " + start
        const end_time = date + " " + end
        const { status } = await this.api.post(`/dentists/timeslots`, { start_time, end_time })
        if (status === 201) {
            p.outro(`Timeslot published for ${date} starting at ${start} until ${end}`);
        } else {
            p.outro('All fields have to be filled.');
        }
    } catch (error) {
        console.log(error)
        p.outro('All fields have to be filled');
    }
}
async viewTimeslots(){
    try {
        const { status, data } = await this.api.get(`/dentists/${this.state.userId}/timeslots`);

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

async cancelAppointment(){
                    try {
                        const { status, data } = await this.api.get(`/appointments`);
                
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
                                        const { status, data } = await this.api.patch(`/appointments/${id}`, {cancelled});
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
}

async deleteTimeslot(){
    const id = await p.text({
        message: 'Enter the id of a timeslot that you want to delete',
        validate: (value) => {
            if (!value) return 'Please enter an id';
        },
    })
    try {
        const {status} = await this.api.delete(`/dentists/timeslots/${id}`)
        if (status !== 200){
            console.log("Some error occurred when trying to delete a timeslot")
        }
        console.log("Successfully deleted a timeslot!")
    } catch(error){
        console.log("Some error occurred when trying to delete a timeslot")
    }
}


    }

export default DentistMenu