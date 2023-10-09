import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const signupRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  signup: publicProcedure
    .input(z.object({ email: z.string(), password: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.user.create({
        data: {
          email: input.email,
          password: input.password,
        },
      });
    }),
});
