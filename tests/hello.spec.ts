import HelloWorld from "../src/components/HelloWorld.vue";
import { test, expect } from "vitest";

import { mount } from "@vue/test-utils";

test("Test HelloWorld Props", () => {
    const wrapper = mount(HelloWorld, {
        props: {
            msg: "111111"
        }
    });

    // Assert the rendered text of the component
    expect(wrapper.text()).toContain("111111");
});
