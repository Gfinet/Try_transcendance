export const Fetches = () => {

  ////Open-meteo
  const fetchTemp = async (setTemp) => {
    const token = localStorage.getItem('token');
      fetch('/api/temptoday',{
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
  }})
  .then(res => res.json())
  .then(data => {
    // console.log(data)
    const val = Array(data.message.length)
    for (let i=0; i<data.message.length; i++)
    {
      const time = new Date(data.message[i].time)
      val[i] = {
        time : time.toLocaleString('fr-BE', { hour: '2-digit', timeZone: 'Europe/Brussels' }), //getUTCHours() + "h",
        temperature : data.message[i].temp,
        sun  : data.message[i].SolarRay * 15 * 5 / (12)
      }
    }
    setTemp(val);
  })}

  ////Sunny-boy Onduleur
  const fetchWatt = async (setWatt) => {
    const token = localStorage.getItem('token');
    fetch('/api/mbtoday',{
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
  }})
  .then(res => res.json())
  .then(data => {
    const val = []//Array(data.message.length)
    for (let i=0; i<data.message.length; i++)
    {
      if (data.message[i].watts > 0)
      {
        let hour = new Date(data.message[i].time)
        val.push( {

          time : hour.toLocaleString('fr-BE', { 
            // day: '2-digit',
            // month: '2-digit',
            hour: '2-digit', 
            minute : '2-digit',
            timeZone: 'Europe/Brussels' }),
            watt : data.message[i].watts,
          })
      }
      val.total = data.message[i].total || 0
    }
    // console.log("LEN",val.length);
    setWatt(val);
  })}

  ////Db Washing Prog
  const fetchDbWashingProg = async (setWash) => {
    const token = localStorage.getItem('token');
    fetch('/api/miele/list', {
      method: 'POST',
      body: 5,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }).then(res => res.json())
    .then(data => {setWash(data.message)})
  }

  ////Miele devices
  const fetchWashDevices = async (setDevices) => {
    const token = localStorage.getItem('token');
    fetch('/api/miele/devices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res =>res.json())
    .then(data => {setDevices(data)})//; console.log("DEVICES",data)})
    }

  const fetchDevInfo = async (setDevInfo, device) => {
    const token = localStorage.getItem('token');
    let val = {};
    fetch(`/api/miele/devices/${device}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res =>res.json())
    .then(data => {val = data})
    fetch(`/api/miele/devices/${device}/programs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res =>res.json())
    .then(data => {val.programs = data; setDevInfo(val)})
    // .then(data => {val.programs = data; setDevInfo(val);console.log("DEV2",val)})
    }

  const fetchClim = async (setClim) => {
    const token = localStorage.getItem('token');
      fetch('/api/clim/status',{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      }})
      .then(res => res.json())
      .then(data => {setClim(data?.data)})
  }

  return {
    fetchTemp,
    fetchWatt,
    fetchDbWashingProg, 
    fetchWashDevices,
    fetchDevInfo,
    fetchClim
  };
}