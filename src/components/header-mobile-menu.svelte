<script lang="ts">
    import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
    import { Button } from "@/components/ui/button";
    // import MdiStore24Hour from "~icons/mdi/store-24-hour";

    export const links: Array<{
        href: string;
        text: string;
    }> = [];
</script>

<Sheet>
    <SheetTrigger asChild>
        <Button variant="outline" size="icon" class="shrink-0 md:hidden">
            <!-- {@html MdiStore24Hour} -->
            <span class="sr-only">Toggle navigation menu</span>
        </Button>
    </SheetTrigger>
    <SheetContent side="left">
        <nav class="grid gap-6 text-lg font-medium"></nav>
    </SheetContent>
</Sheet>
