/*
Based on PEG.js released under the MIT license
https://github.com/pegjs/pegjs/blob/b7b87ea8aeeaa1caf096e2da99fd95a971890ca1/LICENSE
*/

import gp from "./generated-parser";

export = peg;
export as namespace peg;

declare namespace peg {

    type Grammar = ast.Grammar;
    type GeneratedParser<T = unknown> = gp.API<T>;
    type SyntaxError = gp.SyntaxErrorConstructor;
    type SourceLocation = gp.SourceLocation;

    /**
     * PEG.js version (uses semantic versioning).
     */
    const VERSION: string;

    /**
     * Thrown when the grammar contains an error.
     */
    class GrammarError {

        name: string;
        message: string;
        location?: SourceLocation;

        constructor( message: string, location?: SourceLocation );

    }

    /**
     * PEG.js AST
     */
    namespace ast {

        /**
         * PEG.js node constructor, used internally by the PEG.js parser to create nodes.
         */
        class Node {

            type: string;
            location: SourceLocation;

            constructor( type: string, location: SourceLocation );

        }

        /**
         * The main PEG.js AST class returned by the parser.
         */
        class Grammar extends Node {

            // Default properties and methods

            private readonly _alwaysConsumesOnSuccess: unknown;
            type: "grammar";
            comments?: CommentMap;
            initializer?: Initializer;
            rules: Rule[];

            constructor(
                initializer: void | Initializer,
                rules: Rule[],
                comments: void | CommentMap,
                location: SourceLocation,
            );

            findRule( name: string ): Rule | void;
            indexOfRule( name: string ): number;
            alwaysConsumesOnSuccess( node: ast.Object ): boolean;

            // Added by Bytecode generator

            literals?: string[];
            classes?: string[];
            expectations?: string[];
            functions?: string[];

            // Added by JavaScript generator

            code?: string;

        }

        interface CommentMap {

            [ offset: number ]: {

                text: string;
                multiline: boolean;
                location: SourceLocation;

            };

        }

        type INode = peg.ast.Node

        /**
         * This type represent's all PEG.js AST node's.
         */
        type Object
            = Grammar
            | Initializer
            | Rule
            | Named
            | Expression;

        interface Initializer extends INode {

            type: "initializer";
            code: string;

        }

        interface Rule extends INode {

            // Default properties

            type: "rule",
            name: string;
            expression: Named | Expression;

            // Added by calc-report-failures pass

            reportFailures?: boolean;

            // Added by inference-match-result pass

            match?: number;

            // Added by generate-bytecode pass

            bytecode?: number[];

        }

        interface Named extends INode {

            type: "named";
            name: string;
            expression: Expression;

        }

        type Expression
            = ChoiceExpression
            | ActionExpression
            | SequenceExpression
            | LabeledExpression
            | PrefixedExpression
            | SuffixedExpression
            | PrimaryExpression;

        interface ChoiceExpression extends INode {

            type: "choice";
            alternatives: (
                ActionExpression
                | SequenceExpression
                | LabeledExpression
                | PrefixedExpression
                | SuffixedExpression
                | PrimaryExpression
            )[];

        }

        interface ActionExpression extends INode {

            type: "action";
            expression: (
                SequenceExpression
                | LabeledExpression
                | PrefixedExpression
                | SuffixedExpression
                | PrimaryExpression
            );
            code: string;

        }

        interface SequenceExpression extends INode {

            type: "sequence",
            elements: (
                LabeledExpression
                | PrefixedExpression
                | SuffixedExpression
                | PrimaryExpression
            )[];

        }

        interface LabeledExpression extends INode {

            type: "labeled";
            pick?: true;
            label: string;
            expression: (
                PrefixedExpression
                | SuffixedExpression
                | PrimaryExpression
            );

        }

        interface PrefixedExpression extends INode {

            type: "text" | "simple_and" | "simple_not";
            expression: SuffixedExpression | PrimaryExpression;

        }

        interface SuffixedExpression extends INode {

            type: "optional" | "zero_or_more" | "one_or_more";
            expression: PrimaryExpression;

        }

        type PrimaryExpression
            = LiteralMatcher
            | CharacterClassMatcher
            | AnyMatcher
            | RuleReferenceExpression
            | SemanticPredicateExpression
            | GroupExpression;

        interface LiteralMatcher extends INode {

            type: "literal";
            value: string;
            ignoreCase: boolean;

        }

        interface CharacterClassMatcher extends INode {

            type: "class";
            parts: ( string[] | string )[];
            inverted: boolean;
            ignoreCase: boolean;

        }

        interface AnyMatcher extends INode {

            type: "any";

        }

        interface RuleReferenceExpression extends INode {

            type: "rule_ref";
            name: string;

        }

        interface SemanticPredicateExpression extends INode {

            type: "semantic_and" | "semantic_not";
            code: string;

        }

        interface GroupExpression extends INode {

            type: "group";
            expression: LabeledExpression | SequenceExpression;

        }

        namespace visitor {

            interface IVisitorMap<U = void> {

                [ key: string ]: unknown;
                grammar?<R = U>( node: Grammar, ...args ): R;
                initializer?<R = U>( node: Initializer, ...args ): R;
                rule?<R = U>( node: Rule, ...args ): R;
                named?<R = U>( node: Named, ...args ): R;
                choice?<R = U>( node: ChoiceExpression, ...args ): R;
                action?<R = U>( node: ActionExpression, ...args ): R;
                sequence?<R = U>( node: SequenceExpression, ...args ): R;
                labeled?<R = U>( node: LabeledExpression, ...args ): R;
                text?<R = U>( node: PrefixedExpression, ...args ): R;
                simple_and?<R = U>( node: PrefixedExpression, ...args ): R;
                simple_not?<R = U>( node: PrefixedExpression, ...args ): R;
                optional?<R = U>( node: SuffixedExpression, ...args ): R;
                zero_or_more?<R = U>( node: SuffixedExpression, ...args ): R;
                one_or_more?<R = U>( node: SuffixedExpression, ...args ): R;
                literal?<R = U>( node: LiteralMatcher, ...args ): R;
                class?<R = U>( node: CharacterClassMatcher, ...args ): R;
                any?<R = U>( node: AnyMatcher, ...args ): R;
                rule_ref?<R = U>( node: RuleReferenceExpression, ...args ): R;
                semantic_and?<R = U>( node: SemanticPredicateExpression, ...args ): R;
                semantic_not?<R = U>( node: SemanticPredicateExpression, ...args ): R;
                group?<R = U>( node: GroupExpression, ...args ): R;

            }

            interface IVisitor<R = unknown> {

                ( node: ast.Object, ...args ): R;

            }

            class ASTVisitor implements IVisitorMap {

                visit: IVisitor;

            }

            interface IVisitorBuilder<T = void, R = unknown> {

                ( functions: IVisitorMap<T> ): IVisitor<R>;

            }

            interface IOn {

                property( name: string ): IVisitor;
                children( name: string ): IVisitor;

            }

            const build: IVisitorBuilder;
            const on: IOn;

        }

        interface visitor {

            ASTVisitor: visitor.ASTVisitor;
            build: visitor.IVisitorBuilder;
            on: visitor.IOn;

        }

    }

    /**
     * A generated PEG.js parser to parse PEG.js grammar source's.
     */
    namespace parser {

        interface IOptions extends gp.IOptions {

            extractComments?: boolean;
            reservedWords?: string[];

        }

        const SyntaxError: SyntaxError;
        function parse( input: string, options?: IOptions ): Grammar;

    }

    /**
     * The PEG.js compiler.
     */
    namespace compiler {

        type FormatOptions = "amd" | "bare" | "commonjs" | "es" | "globals" | "umd";
        type OptimizeOptions = "size" | "speed";
        type OutputOptions = "parser" | "source";

        interface ICompilerOptions<T = OutputOptions> {

            [ key: string ]: unknown;
            allowedStartRules?: string[];
            cache?: boolean;
            context?: { [ name: string ]: unknown; };
            dependencies?: { [ name: string ]: string; };
            exportVar?: string;
            features?: IGeneratedParserFeatures;
            format?: FormatOptions;
            header?: string | string[];
            optimize?: OptimizeOptions;
            output?: T;
            trace?: boolean;

        }

        interface ICompilerPassOptions extends ICompilerOptions {

            allowedStartRules: string[];
            cache: boolean;
            context: { [ name: string ]: unknown; };
            dependencies: { [ name: string ]: string; };
            exportVar: string;
            features: IGeneratedParserFeatures;
            format: FormatOptions;
            header: string | string[];
            optimize: OptimizeOptions;
            output: OutputOptions;
            trace: boolean;

        }

        interface IGeneratedParserFeatures {

            [ key: string ]: boolean;
            text: boolean;
            offset: boolean;
            range: boolean;
            location: boolean;
            expected: boolean;
            error: boolean;
            filename: boolean;
            DefaultTracer: boolean;

        }

        interface ICompilerPass {

            ( node: Grammar ): void;
            ( node: Grammar, session: Session ): void;
            ( node: Grammar, session: Session, options: ICompilerPassOptions ): void;

        }

        interface IPassesMap {

            [ type: string ]: ICompilerPass[];

        }

        interface IOpcodes {

            [ name: string ]: number;

        }

        interface ISessionVM {

            evalModule( code: string, context?: { [ name: string ]: unknown; } ): unknown;

        }

        interface ISessionMessageEmitter {

            ( message: string, location: SourceLocation ): unknown;

        }

        interface ISessionConfig {

            [ key: string ]: unknown;
            opcodes?: IOpcodes;
            parser?: GeneratedParser<Grammar>;
            passes?: IPassesMap;
            visitor?: ast.visitor;
            vm?: ISessionVM;
            warn?: ISessionMessageEmitter;
            error?: ISessionMessageEmitter;

        }

        class Session implements ISessionConfig {

            constructor( config?: ISessionConfig );

            parse( input: string, options?: parser.IOptions ): Grammar;

            buildVisitor: ast.visitor.IVisitorBuilder;

            warn: ISessionMessageEmitter;
            error: ISessionMessageEmitter;
            fatal: ISessionMessageEmitter;

        }

        namespace passes {

            namespace check {

                function reportUndefinedRules( ast: Grammar, session: Session, options: ICompilerPassOptions ): void;
                function reportDuplicateRules( ast: Grammar, session: Session ): void;
                function reportUnusedRules( ast: Grammar, session: Session, options: ICompilerPassOptions ): void;
                function reportDuplicateLabels( ast: Grammar, session: Session ): void;
                function reportInfiniteRecursion( ast: Grammar, session: Session ): void;
                function reportInfiniteRepetition( ast: Grammar, session: Session ): void;
                function reportIncorrectPlucking( ast: Grammar, session: Session ): void;

            }

            namespace transform {

                function removeProxyRules( ast: Grammar, session: Session, options: ICompilerPassOptions ): void;

            }

            namespace generate {

                function calcReportFailures( ast: Grammar, session: Session, options: ICompilerPassOptions ): void;
                function inferenceMatchResult( ast: Grammar, session: Session ): void;
                function generateBytecode( ast: Grammar, session: Session ): void;
                function generateJS( ast: Grammar, session: Session, options: ICompilerPassOptions ): void;

            }

        }

        /**
         * Generate's a parser from the PEG.js AST and returns it.
         */
        function compile( ast: Grammar, session: Session, options?: ICompilerOptions ): GeneratedParser | string;

        /**
         * Generate's a parser from the PEG.js AST, then evaluates's the source before returning the parser object.
         */
        function compile( ast: Grammar, session: Session, options?: ICompilerOptions<"parser"> ): GeneratedParser;

        /**
         * Generate's a parser from the PEG.js AST and returns the JavaScript based source.
         */
        function compile( ast: Grammar, session: Session, options?: ICompilerOptions<"source"> ): string;

    }

    // peg.util

    interface IStageMap {

        [ stage: string ]: compiler.ICompilerPass[]
            | { [ pass: string ]: compiler.ICompilerPass };

    }

    interface IIterator<R = unknown> {

        ( value: unknown ): R;
        ( value: unknown, key: string ): R;

    }

    interface IArrayUtils {

        findIndex( array: unknown[], condition: IIterator ): number;
        find( array: unknown[], condition: IIterator ): unknown;

    }
    interface IJavaScriptUtils {

        stringEscape( s: string ): string;
        regexpEscape( s: string ): string;
        reservedWords: string[];

    }
    interface IObjectUtils {

        clone( source: unknown ): unknown;
        each( object: unknown, iterator: IIterator<void> ): void;
        extend( target: unknown, source: unknown ): unknown;
        map( object: unknown, transformer: IIterator ): unknown;
        values( object: unknown, transformer?: IIterator ): unknown[];
        enforceFastProperties( o: unknown ): unknown;

    }
    interface util extends IArrayUtils, IJavaScriptUtils, IObjectUtils, compiler.ISessionVM {

        noop(): void;
        convertPasses( stages: IStageMap ): compiler.IPassesMap;
        processOptions( options: unknown, defaults: unknown ): unknown;

    }
    const util: util;

    // peg.generate

    interface IPlugin<T = compiler.OutputOptions> {

        [ key: string ]: unknown;
        use( session: compiler.Session ): void;
        use( session: compiler.Session, options: IBuildOptions<T> ): void;

    }

    interface IBuildOptions<T = compiler.OutputOptions> extends compiler.ICompilerOptions<T> {

        plugins?: IPlugin<T>[];
        parser?: parser.IOptions;

    }

    /**
     * Generate's a parser from the PEG.js grammar and returns it.
     */
    function generate( grammar: string, options?: IBuildOptions ): GeneratedParser | string;

    /**
     * Generate's a parser from the PEG.js grammar, then evaluates's the source before returning the parser object.
     */
    function generate( grammar: string, options?: IBuildOptions<"parser"> ): GeneratedParser;

    /**
     * Generate's a parser from the PEG.js grammar and returns the JavaScript based source.
     */
    function generate( grammar: string, options?: IBuildOptions<"source"> ): string;

}
/// <reference path="./api.d.ts" />

declare module "pegjs" {

    export default peg;

}

declare module "pegjs/lib/grammar-error" {

    export default peg.GrammarError;

}

declare module "pegjs/lib/parser" {

    export default peg.parser;

}

declare module "pegjs/lib/peg" {

    export default peg;

}

declare module "pegjs/lib/ast" {

    export default peg.ast;

}

declare module "pegjs/lib/ast/Grammar" {

    export default peg.ast.Grammar;

}

declare module "pegjs/lib/ast/Node" {

    export default peg.ast.Node;

}

declare module "pegjs/lib/ast/visitor" {

    export default peg.ast.visitor;

}

declare module "pegjs/lib/compiler" {

    export default peg.compiler;

}

declare module "pegjs/lib/compiler/index" {

    export default peg.compiler;

}

declare module "pegjs/lib/compiler/opcodes" {

    const opcodes: peg.compiler.IOpcodes;
    export default opcodes;

}

declare module "pegjs/lib/compiler/session" {

    export default peg.compiler.Session;

}

declare module "pegjs/lib/compiler/passes/calc-report-failures" {

    export default peg.compiler.passes.generate.calcReportFailures;

}

declare module "pegjs/lib/compiler/passes/generate-bytecode" {

    export default peg.compiler.passes.generate.generateBytecode;

}

declare module "pegjs/lib/compiler/passes/generate-js" {

    export default peg.compiler.passes.generate.generateJS;

}

declare module "pegjs/lib/compiler/passes/inference-match-result" {

    export default peg.compiler.passes.generate.inferenceMatchResult;

}

declare module "pegjs/lib/compiler/passes/remove-proxy-rules" {

    export default peg.compiler.passes.transform.removeProxyRules;

}

declare module "pegjs/lib/compiler/passes/report-duplicate-labels" {

    export default peg.compiler.passes.check.reportDuplicateLabels;

}

declare module "pegjs/lib/compiler/passes/report-duplicate-rules" {

    export default peg.compiler.passes.check.reportDuplicateRules;

}

declare module "pegjs/lib/compiler/passes/report-incorrect-plucking" {

    export default peg.compiler.passes.check.reportIncorrectPlucking;

}

declare module "pegjs/lib/compiler/passes/report-infinite-recursion" {

    export default peg.compiler.passes.check.reportInfiniteRecursion;

}

declare module "pegjs/lib/compiler/passes/report-infinite-repetition" {

    export default peg.compiler.passes.check.reportInfiniteRepetition;

}

declare module "pegjs/lib/compiler/passes/report-undefined-rules" {

    export default peg.compiler.passes.check.reportUndefinedRules;

}

declare module "pegjs/lib/compiler/passes/report-unused-rules" {

    export default peg.compiler.passes.check.reportUnusedRules;

}

declare module "pegjs/lib/util" {

    export default peg.util;

}

declare module "pegjs/lib/util/arrays" {

    const arrays: peg.IArrayUtils;
    export default arrays;

}

declare module "pegjs/lib/util/index" {

    export default peg.util;

}

declare module "pegjs/lib/util/js" {

    const js: peg.IJavaScriptUtils;
    export default js;

}

declare module "pegjs/lib/util/objects" {

    const objects: peg.IObjectUtils;
    export default objects;

}

declare module "pegjs/lib/util/vm" {

    const vm: peg.compiler.ISessionVM;
    export default vm;

}
