function parseTime(date, time) {
    const [hourMinute, period] = time.split(' ');
    let [hours, minutes] = hourMinute.split(':').map(Number);
    if (period) {
        if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
        if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
    }
    return new Date(`${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
}

const now = new Date();
const currentDate = now.toISOString().split('T')[0]; 
const currentHour = now.getHours();
const currentMinute = now.getMinutes();

// Assuming you're using a Mongoose model named Rituals
const ritual = await Rituals.findOne({});
if (!ritual) {
    console.log("No ritual found.");
    return;
}

const startTime = parseTime(currentDate, ritual.start_time);
const endTime = parseTime(currentDate, ritual.end_time);

const isLive = startTime <= now && now <= endTime;
console.log("Ritual Name:", ritual.ritual_name);
console.log("Is live:", isLive);
