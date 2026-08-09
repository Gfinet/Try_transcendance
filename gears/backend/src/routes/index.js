import auth from './auth.js'
import SMA from './Solar_Wash/SMA.js'
import mb from './Solar_Wash/modbus_solar.js'
import weather from './Solar_Wash/weather.js'
import miele from './Solar_Wash/mieleWashing.js'
import clim from './Clim/ClimHandler.js'
import webpush from './web-push.js'



export default async function (server, opts) {

  	server.register(auth)
  	server.register(SMA)
  	server.register(mb)
  	server.register(weather)
  	server.register(miele, { prefix: '/miele' })
  	server.register(clim, { prefix: '/clim' })
  	server.register(webpush)

}