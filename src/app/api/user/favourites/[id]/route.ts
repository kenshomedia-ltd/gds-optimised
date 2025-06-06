// // src/app/api/user/favorites/[id]/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Call your Strapi API to remove favorite
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/user-games/${params.id}`,
//       {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${session.user.token}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to remove favorite");
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error removing favorite:", error);
//     return NextResponse.json(
//       { error: "Failed to remove favorite" },
//       { status: 500 }
//     );
//   }
// }
