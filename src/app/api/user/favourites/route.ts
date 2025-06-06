// // src/app/api/user/favorites/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { gameId } = await request.json();

//     // Call your Strapi API to add favorite
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/user-games`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session.user.token}`,
//         },
//         body: JSON.stringify({
//           data: {
//             user: session.user.id,
//             game: gameId,
//           },
//         }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to add favorite");
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("Error adding favorite:", error);
//     return NextResponse.json(
//       { error: "Failed to add favorite" },
//       { status: 500 }
//     );
//   }
// }
