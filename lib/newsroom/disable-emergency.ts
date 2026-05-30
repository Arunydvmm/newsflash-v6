import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function disableEmergencyStop() {
  try {
    const config = await prisma.nfSystemConfig.findFirst()
    if (config) {
      await prisma.nfSystemConfig.update({
        where: { id: config.id },
        data: { emergencyStop: false }
      })
      console.log('Emergency kill switch disabled')
    } else {
      await prisma.nfSystemConfig.create({
        data: { emergencyStop: false }
      })
      console.log('Created config with emergency stop disabled')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

disableEmergencyStop()
