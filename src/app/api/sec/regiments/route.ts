// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BONUS_PHONE_NUMBERS = (process.env.REPUBLIC_DAY_BONUS_PHONES || '').split(',').filter(Boolean);

// Map cities to regions
const cityToRegionMap: Record<string, string> = {
    // NORTH
    'Delhi': 'NORTH',
    'New Delhi': 'NORTH',
    'Noida': 'NORTH',
    'Gurgaon': 'NORTH',
    'Gurugram': 'NORTH',
    'Chandigarh': 'NORTH',
    'Jaipur': 'NORTH',
    'Lucknow': 'NORTH',
    'Kanpur': 'NORTH',
    'Agra': 'NORTH',
    'Varanasi': 'NORTH',
    'Meerut': 'NORTH',
    'Ghaziabad': 'NORTH',
    'Faridabad': 'NORTH',
    'Hisar': 'NORTH',
    'Rohtak': 'NORTH',
    'Panipat': 'NORTH',
    'Ambala': 'NORTH',
    'Shimla': 'NORTH',
    'Srinagar': 'NORTH',
    'Jammu': 'NORTH',

    // SOUTH
    'Bangalore': 'SOUTH',
    'Bengaluru': 'SOUTH',
    'Chennai': 'SOUTH',
    'Hyderabad': 'SOUTH',
    'Kochi': 'SOUTH',
    'Cochin': 'SOUTH',
    'Thiruvananthapuram': 'SOUTH',
    'Trivandrum': 'SOUTH',
    'Coimbatore': 'SOUTH',
    'Madurai': 'SOUTH',
    'Visakhapatnam': 'SOUTH',
    'Vijayawada': 'SOUTH',
    'Tirupati': 'SOUTH',
    'Mysore': 'SOUTH',
    'Mangalore': 'SOUTH',
    'Mangaluru': 'SOUTH',
    'Belgaum': 'SOUTH',
    'Belagavi': 'SOUTH',
    'Hubballi': 'SOUTH',
    'Dharwad': 'SOUTH',
    'Raichur': 'SOUTH',
    'Gulbarga': 'SOUTH',
    'Kurnool': 'SOUTH',
    'Nellore': 'SOUTH',
    'Ongole': 'SOUTH',
    'Guntur': 'SOUTH',
    'Rajahmundry': 'SOUTH',
    'Kakinada': 'SOUTH',
    'Kollam': 'SOUTH',
    'Alappuzha': 'SOUTH',
    'Ernakulam': 'SOUTH',
    'Thrissur': 'SOUTH',
    'Kannur': 'SOUTH',
    'Kasaragod': 'SOUTH',
    'Puducherry': 'SOUTH',
    'Pondicherry': 'SOUTH',
    'Yanam': 'SOUTH',
    'Mahe': 'SOUTH',
    'Karaikal': 'SOUTH',

    // EAST
    'Kolkata': 'EAST',
    'Calcutta': 'EAST',
    'Patna': 'EAST',
    'Guwahati': 'EAST',
    'Assam': 'EAST',
    'Bhubaneswar': 'EAST',
    'Odisha': 'EAST',
    'Ranchi': 'EAST',
    'Jharkhand': 'EAST',
    'Jamshedpur': 'EAST',
    'Dhanbad': 'EAST',
    'Giridih': 'EAST',
    'Bokaro': 'EAST',
    'Siliguri': 'EAST',
    'Darjeeling': 'EAST',
    'Jalpaiguri': 'EAST',
    'Asansol': 'EAST',
    'Durgapur': 'EAST',
    'Bardhaman': 'EAST',
    'Barddhaman': 'EAST',
    'Birbhum': 'EAST',
    'Purulia': 'EAST',
    'Bankura': 'EAST',
    'Medinipur': 'EAST',
    'Hooghly': 'EAST',
    'Howrah': 'EAST',
    'North 24 Parganas': 'EAST',
    'South 24 Parganas': 'EAST',
    'Sundarbans': 'EAST',
    'Imphal': 'EAST',
    'Manipur': 'EAST',
    'Shillong': 'EAST',
    'Meghalaya': 'EAST',
    'Aizawl': 'EAST',
    'Mizoram': 'EAST',
    'Agartala': 'EAST',
    'Tripura': 'EAST',
    'Nagaland': 'EAST',
    'Kohima': 'EAST',
    'Dimapur': 'EAST',
    'Itanagar': 'EAST',
    'Arunachal Pradesh': 'EAST',
    'Tezpur': 'EAST',
    'Silchar': 'EAST',
    'Barpeta': 'EAST',
    'Nagaon': 'EAST',
    'Golaghat': 'EAST',
    'Jorhat': 'EAST',
    'Dibrugarh': 'EAST',
    'Lakhimpur': 'EAST',
    'Dhemaji': 'EAST',
    'Sonitpur': 'EAST',
    'Biswanath': 'EAST',
    'Udalguri': 'EAST',
    'Darrang': 'EAST',
    'Morigaon': 'EAST',
    'Kamrup': 'EAST',
    'Kamrup Metropolitan': 'EAST',
    'Nalbari': 'EAST',
    'Sualkuchi': 'EAST',
    'Barpeta Road': 'EAST',
    'Kokrajhar': 'EAST',
    'Chirang': 'EAST',
    'Bongaigaon': 'EAST',
    'Dhubri': 'EAST',
    'Goalpara': 'EAST',
    'Cachar': 'EAST',
    'Hailakandi': 'EAST',
    'Karimganj': 'EAST',

    // WEST
    'Mumbai': 'WEST',
    'Bombay': 'WEST',
    'Pune': 'WEST',
    'Poona': 'WEST',
    'Ahmedabad': 'WEST',
    'Surat': 'WEST',
    'Vadodara': 'WEST',
    'Baroda': 'WEST',
    'Rajkot': 'WEST',
    'Jamnagar': 'WEST',
    'Junagadh': 'WEST',
    'Bhavnagar': 'WEST',
    'Anand': 'WEST',
    'Gandhinagar': 'WEST',
    'Indore': 'WEST',
    'Bhopal': 'WEST',
    'Jabalpur': 'WEST',
    'Gwalior': 'WEST',
    'Ujjain': 'WEST',
    'Sagar': 'WEST',
    'Ratlam': 'WEST',
    'Khandwa': 'WEST',
    'Khargone': 'WEST',
    'Burhanpur': 'WEST',
    'Betul': 'WEST',
    'Chhindwara': 'WEST',
    'Seoni': 'WEST',
    'Mandla': 'WEST',
    'Balaghat': 'WEST',
    'Nagpur': 'WEST',
    'Aurangabad': 'WEST',
    'Nashik': 'WEST',
    'Ahmednagar': 'WEST',
    'Solapur': 'WEST',
    'Sholapur': 'WEST',
    'Sangli': 'WEST',
    'Satara': 'WEST',
    'Kolhapur': 'WEST',
    'Ratnagiri': 'WEST',
    'Sindhudurg': 'WEST',
    'Thane': 'WEST',
    'Raigad': 'WEST',
    'Palghar': 'WEST',
    'Nashik': 'WEST',
    'Dhule': 'WEST',
    'Nandurbar': 'WEST',
    'Jalgaon': 'WEST',
    'Buldhana': 'WEST',
    'Akola': 'WEST',
    'Amravati': 'WEST',
    'Yavatmal': 'WEST',
    'Washim': 'WEST',
    'Hingoli': 'WEST',
    'Parbhani': 'WEST',
    'Latur': 'WEST',
    'Beed': 'WEST',
    'Osmanabd': 'WEST',
    'Osmania': 'WEST',
    'Nanded': 'WEST',
    'Gondiya': 'WEST',
    'Chandrapur': 'WEST',
    'Gadchiroli': 'WEST',
    'Daman': 'WEST',
    'Diu': 'WEST',
    'Silvassa': 'WEST',
    'Dadra': 'WEST',
    'Nagar Haveli': 'WEST',
};

function getCityRegion(city: string | null | undefined): string {
    if (!city) return 'UNKNOWN';
    return cityToRegionMap[city] || 'UNKNOWN';
}

export async function GET(req: NextRequest) {
    try {
        // First, fetch ALL SECs with their stores
        const allSECs = await prisma.sEC.findMany({
            select: {
                id: true,
                fullName: true,
                phone: true,
                employeeId: true,
                store: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                    }
                }
            }
        });

        // Fetch sales data (matching leaderboard logic)
        const startDate = new Date('2026-01-01T00:00:00.000Z');

        const reports = await prisma.spotIncentiveReport.findMany({
            where: {
                Date_of_sale: {
                    gte: startDate
                },
                spotincentivepaidAt: { not: null },
            },
            select: {
                secId: true,
                plan: {
                    select: {
                        price: true
                    }
                },
            }
        });

        // Initialize userSalesMap with ALL SECs (including 0 sales)
        const userSalesMap = new Map<string, {
            secId: string,
            name: string,
            phone: string,
            employeeId: string | null,
            storeName: string,
            city: string,
            region: string,
            salesAmount: number
        }>();

        // Add all SECs to the map with 0 sales initially
        allSECs.forEach(sec => {
            const city = sec.store?.city || 'Unknown City';
            const region = getCityRegion(city);

            userSalesMap.set(sec.id, {
                secId: sec.id,
                name: sec.fullName || 'Unknown',
                phone: sec.phone,
                employeeId: sec.employeeId,
                storeName: sec.store?.name || 'Unknown Store',
                city: city,
                region: region,
                salesAmount: 0
            });
        });

        // Aggregate sales for users who have sales
        reports.forEach(report => {
            const { secId } = report;
            const sales = report.plan?.price || 0;

            if (userSalesMap.has(secId)) {
                const userData = userSalesMap.get(secId)!;
                userData.salesAmount += sales;
            }
        });

        // Calculate rank based on sales thresholds (matching leaderboard/hall of fame)
        const secsWithRank = Array.from(userSalesMap.values()).map(sec => {
            // Apply Bonus Logic (Hall of Fame Consistency)
            const trimmedPhone = (sec.phone || '').trim();
            if (BONUS_PHONE_NUMBERS.includes(trimmedPhone) && sec.salesAmount < 21000) {
                sec.salesAmount += 21000;
            }

            let rank = 'Sales Veer';
            if (sec.salesAmount >= 200000) rank = 'Sales General';
            else if (sec.salesAmount >= 150000) rank = 'Sales Chief Marshal';
            else if (sec.salesAmount >= 120000) rank = 'Sales Commander';
            else if (sec.salesAmount >= 80000) rank = 'Sales Major';
            else if (sec.salesAmount >= 51000) rank = 'Sales Captain';
            else if (sec.salesAmount >= 21000) rank = 'Sales Lieutenant';

            return {
                ...sec,
                rank,
                totalSales: sec.salesAmount
            };
        });

        // Group by rank and region
        const regimentMatrix: Record<string, Record<string, number>> = {};
        const personnelByRankAndRegion: Record<string, Record<string, any[]>> = {};

        const ranks = [
            'Sales General',
            'Sales Chief Marshal',
            'Sales Commander',
            'Sales Major',
            'Sales Captain',
            'Sales Lieutenant',
            'Sales Veer'
        ];

        const regions = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'UNKNOWN'];

        // Initialize the matrix
        ranks.forEach(rank => {
            regimentMatrix[rank] = {};
            personnelByRankAndRegion[rank] = {};
            regions.forEach(region => {
                regimentMatrix[rank][region] = 0;
                personnelByRankAndRegion[rank][region] = [];
            });
        });

        // Populate the matrix
        secsWithRank.forEach(sec => {
            if (sec.region && regions.includes(sec.region)) {
                regimentMatrix[sec.rank][sec.region]++;
                personnelByRankAndRegion[sec.rank][sec.region].push({
                    id: sec.secId,
                    fullName: sec.name,
                    phone: sec.phone,
                    employeeId: sec.employeeId,
                    storeName: sec.storeName,
                    city: sec.city,
                    region: sec.region,
                    totalSales: sec.totalSales,
                });
            }
        });

        return NextResponse.json({
            success: true,
            matrix: regimentMatrix,
            personnel: personnelByRankAndRegion,
            totalSECs: secsWithRank.length,
        });

    } catch (error: any) {
        console.error('Error fetching regiment data:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
