
/**
 * update-store-regions.ts
 *
 * Script to update the 'region' field for all Store records based on their 'city' field.
 *
 * Usage:
 * Run: npx tsx scripts/update-store-regions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive mapping of Indian cities to regions (North, South, East, West, Central, North East)
// Adjust as per your specific business region definitions.
// Note: Keys should be lowercase for case-insensitive matching.
const CITY_REGION_MAP: { [key: string]: string } = {
    // North
    'delhi': 'NORTH',
    'new delhi': 'NORTH',
    'gurgaon': 'NORTH',
    'gurugram': 'NORTH',
    'noida': 'NORTH',
    'ghaziabad': 'NORTH',
    'faridabad': 'NORTH',
    'chandigarh': 'NORTH',
    'ludhiana': 'NORTH',
    'amritsar': 'NORTH',
    'jalandhar': 'NORTH',
    'patiala': 'NORTH',
    'jaipur': 'NORTH',
    'jodhpur': 'NORTH',
    'udaipur': 'NORTH',
    'kota': 'NORTH',
    'ajmer': 'NORTH',
    'lucknow': 'NORTH',
    'kanpur': 'NORTH',
    'agra': 'NORTH',
    'varanasi': 'NORTH',
    'meerut': 'NORTH',
    'allahabad': 'NORTH',
    'prayagraj': 'NORTH',
    'dehradun': 'NORTH',
    'srinagar': 'NORTH',
    'jammu': 'NORTH',
    'shimla': 'NORTH',

    // South
    'bengaluru': 'SOUTH',
    'bangalore': 'SOUTH',
    'chennai': 'SOUTH',
    'madras': 'SOUTH',
    'hyderabad': 'SOUTH',
    'secunderabad': 'SOUTH',
    'kochi': 'SOUTH',
    'cochin': 'SOUTH',
    'thiruvananthapuram': 'SOUTH',
    'trivandrum': 'SOUTH',
    'mysore': 'SOUTH',
    'mysuru': 'SOUTH',
    'coimbatore': 'SOUTH',
    'madurai': 'SOUTH',
    'visakhapatnam': 'SOUTH',
    'vizag': 'SOUTH',
    'vijayawada': 'SOUTH',
    'mangalore': 'SOUTH',
    'hubli': 'SOUTH',
    'belgaum': 'SOUTH',
    'warangal': 'SOUTH',
    'tirupati': 'SOUTH',
    'salem': 'SOUTH',
    'tiruchirappalli': 'SOUTH',
    'trichy': 'SOUTH',

    // West
    'mumbai': 'WEST',
    'bombay': 'WEST',
    'pune': 'WEST',
    'nagpur': 'WEST',
    'nashik': 'WEST',
    'thane': 'WEST',
    'aurangabad': 'WEST',
    'ahmedabad': 'WEST',
    'surat': 'WEST',
    'vadodara': 'WEST',
    'baroda': 'WEST',
    'rajkot': 'WEST',
    'bhavnagar': 'WEST',
    'jamnagar': 'WEST',
    'gandhinagar': 'WEST',
    'panaji': 'WEST',
    'goa': 'WEST',

    // East
    'kolkata': 'EAST',
    'calcutta': 'EAST',
    'patna': 'EAST',
    'ranchi': 'EAST',
    'bhubaneswar': 'EAST',
    'cuttack': 'EAST',
    'jamshedpur': 'EAST',
    'dhanbad': 'EAST',
    'guwahati': 'EAST',
    'siliguri': 'EAST',
    'durgapur': 'EAST',
    'asnansol': 'EAST',
    'howrah': 'EAST',
    'raipur': 'EAST',
    'durg': 'EAST',
    'korba': 'EAST',
    'bilaspur': 'EAST',

    // Central India (Madhya Pradesh, Chhattisgarh) - Mapped to nearest major region
    'bhopal': 'WEST',
    'indore': 'WEST',
    'gwalior': 'NORTH',
    'jabalpur': 'WEST',
    'ujjain': 'WEST',
    'dewas': 'WEST',
    'ratlam': 'WEST',
    'sagar': 'NORTH',
    'satna': 'NORTH',
    'rewa': 'NORTH',
    'guna': 'NORTH',
    'chhatarpur': 'NORTH',
    'chhindwara': 'WEST',
    'khandwa': 'WEST',
    'neemuch': 'WEST',
    'damoh': 'NORTH',
    'narmadapuram': 'WEST',

    // Additional North cities
    'haridwar': 'NORTH',
    'saharanpur': 'NORTH',
    'bulandshahr': 'NORTH',
    'gorakhpur': 'NORTH',
    'jaunpur': 'NORTH',
    'ara': 'NORTH',
    'bathinda': 'NORTH',
    'firozpur': 'NORTH',
    'hoshiarpur': 'NORTH',
    'moga': 'NORTH',
    'mohali': 'NORTH',
    'panchkula': 'NORTH',
    'panipat': 'NORTH',
    'pathankot': 'NORTH',
    'sangrur': 'NORTH',
    'tarn taran': 'NORTH',
    'yamunanagar': 'NORTH',
    'malerkotla': 'NORTH',
    'sriganganagar': 'NORTH',
    'palwal': 'NORTH',
    'sonipat': 'NORTH',
    'greater noida': 'NORTH',
    'gautam budh nagar': 'NORTH',
    'indirapuram': 'NORTH',

    // Additional South cities
    'belagavi': 'SOUTH',
    'ballari': 'SOUTH',
    'davanagere': 'SOUTH',
    'shivamogga': 'SOUTH',
    'tumkur': 'SOUTH',
    'hassan': 'SOUTH',
    'mandya': 'SOUTH',
    'hosur': 'SOUTH',
    'manipal': 'SOUTH',
    'udupi': 'SOUTH',
    'dharwad': 'SOUTH',
    'kalaburagi': 'SOUTH',
    'vijayapura': 'SOUTH',
    'nelamangala': 'SOUTH',
    'guntur': 'SOUTH',
    'nellore': 'SOUTH',
    'kakinada': 'SOUTH',
    'rajahmundry': 'SOUTH',
    'eluru': 'SOUTH',
    'ongole': 'SOUTH',
    'kadapa': 'SOUTH',
    'kurnool': 'SOUTH',
    'machilipatnam': 'SOUTH',
    'madanapalle': 'SOUTH',
    'karimnagar': 'SOUTH',
    'khammam': 'SOUTH',
    'mahbubnagar': 'SOUTH',
    'hanamkonda': 'SOUTH',
    'andhra pradesh': 'SOUTH',
    'telanagna': 'SOUTH',
    'telangana': 'SOUTH',
    'erode': 'SOUTH',
    'tiruppur': 'SOUTH',
    'vellore': 'SOUTH',
    'dindigul': 'SOUTH',
    'dharma puri': 'SOUTH',
    'dharmapuri': 'SOUTH',
    'thrissur': 'SOUTH',
    'palakkad': 'SOUTH',
    'kozhikode': 'SOUTH',
    'kottayam': 'SOUTH',
    'kottakal': 'SOUTH',
    'perinthalmanna': 'SOUTH',
    'puducherry': 'SOUTH',

    // Additional West cities (Maharashtra)
    'amravati': 'WEST',
    'ahmednagar': 'WEST',
    'akola': 'WEST',
    'kolhapur': 'WEST',
    'solapur': 'WEST',
    'nanded': 'WEST',
    'latur': 'WEST',
    'jalna': 'WEST',
    'beed': 'WEST',
    'chandrapur': 'WEST',
    'navi mumbai': 'WEST',
    'kalyan': 'WEST',
    'ambernath': 'WEST',
    'badlapur': 'WEST',
    'palghar': 'WEST',
    'ratnagiri': 'WEST',
    'sangli': 'WEST',
    'miraj': 'WEST',
    'baramati': 'WEST',
    'sangamner': 'WEST',
    'chhatrapati sambhaji nagar': 'WEST',
    'shahad': 'WEST',

    // Additional West cities (Gujarat)
    'anand': 'WEST',
    'gandhidham': 'WEST',
    'mehsana': 'WEST',
    'navsari': 'WEST',
    'vapi': 'WEST',
    'valsad': 'WEST',
    'godhra': 'WEST',
    'junagadh': 'WEST',
    'porbandar': 'WEST',
    'surendranagar': 'WEST',
    'amreli': 'WEST',
    'bharuch': 'WEST',
    'ankleshwar': 'WEST',
    'bardoli': 'WEST',
    'dahod': 'WEST',
    'himatnagar': 'WEST',
    'morbi': 'WEST',
    'nadiad': 'WEST',
    'palanpur': 'WEST',
    'patan': 'WEST',
    'sanand': 'WEST',
    'bhuj': 'WEST',

    // Additional West cities (Goa)
    'panjim': 'WEST',
    'dabolim': 'WEST',
    'porvorim': 'WEST',

    // Additional East cities
    'asansol': 'EAST',
    'burdwan': 'EAST',
    'serampore': 'EAST',
    'krishnanagar': 'EAST',
    'cooch behar': 'EAST',
    'jalpaiguri': 'EAST',
    'darbhanga': 'EAST',
    'muzaffarpur': 'EAST',
    'gaya': 'EAST',
    'bhilai': 'EAST',
    'rajnandgaon': 'EAST',
    'shillong': 'EAST',
    'tezpur': 'EAST',

    // Central/North (Uttar Pradesh - additional)
    'ichalkranjii': 'WEST',

    // Haryana (additional)
    'bhiwadi': 'NORTH',
    'boisar': 'WEST',
    'zirakhpur': 'NORTH',
};

async function main() {
    console.log('='.repeat(60));
    console.log('Starting Store Region Update Script');
    console.log('='.repeat(60));

    try {
        // 1. Fetch all stores
        const allStores = await prisma.store.findMany();
        console.log(`📦 Found ${allStores.length} stores in total.`);

        let updatedCount = 0;
        let skippedCount = 0;
        let notFoundCityCount = 0;
        const unknownCities = new Set<string>();

        console.log('🔄 Processing stores...');

        // 2. Iterate and update
        for (const store of allStores) {
            if (!store.city) {
                console.log(`⚠️  Store ID: ${store.id} (${store.name}) has NO CITY. Skipping.`);
                skippedCount++;
                continue;
            }

            const cityKey = store.city.toLowerCase().trim();
            const region = CITY_REGION_MAP[cityKey];

            if (region) {
                // Update the store
                await prisma.store.update({
                    where: { id: store.id },
                    data: { region: region },
                });
                // console.log(`✅ Updated Store: ${store.name} (${store.city}) -> ${region}`); // Verbose log
                updatedCount++;
            } else {
                // console.log(`❌ Region not found for city: "${store.city}" (Store: ${store.name})`); // Verbose log
                unknownCities.add(store.city);
                notFoundCityCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Update Complete!');
        console.log('='.repeat(60));
        console.log(`Total Stores Processed: ${allStores.length}`);
        console.log(`Successfully Updated:   ${updatedCount}`);
        console.log(`Skipped (No City):      ${skippedCount}`);
        console.log(`Skipped (Unknown City): ${notFoundCityCount}`);

        if (unknownCities.size > 0) {
            console.log('\n⚠️  Cities not found in mapping:');
            console.log(Array.from(unknownCities).sort().join(', '));
            console.log('\nPlease update the CITY_REGION_MAP in the script and re-run if needed.');
        }

    } catch (error) {
        console.error('❌ Error executing script:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
